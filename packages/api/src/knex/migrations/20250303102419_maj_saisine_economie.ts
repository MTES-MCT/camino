import { CaminoDate } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeId } from 'camino-common/src/etape'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { Knex } from 'knex'

const OLD_ETAPES_TYPES_NAMES = {
  scg: "saisine du conseil général de l'économie (CGE)",
  rcg: "rapport du conseil général de l'économie (CGE)",
} as const

export const up = async (knex: Knex): Promise<void> => {
  const { rows }: { rows: { id: EtapeId; titre_demarche_id: DemarcheId; type_id: EtapeTypeId; ordre: number; date: CaminoDate }[] } =
    await knex.raw(`SELECT te.id, te.titre_demarche_id, te.type_id, te.ordre, te.date
  FROM titres_etapes te WHERE te.type_id IN ('acg', 'scg', 'rcg') AND te.archive IS FALSE
  ORDER BY te.titre_demarche_id ASC, te.ordre ASC`)

  const toBeMerged = rows.reduce<{ titre_demarche_id: DemarcheId; etapes: { id: EtapeId; type_id: EtapeTypeId; date: CaminoDate; ordre: number }[] }[]>((acc, row) => {
    const demarchePrecedente = acc.slice(-1)[0]
    const etapePrecedente = isNotNullNorUndefined(demarchePrecedente) ? (demarchePrecedente.etapes.slice(-1)[0] ?? null) : null
    if (isNotNullNorUndefined(etapePrecedente) && demarchePrecedente.titre_demarche_id === row.titre_demarche_id && etapePrecedente.ordre === row.ordre - 1) {
      demarchePrecedente.etapes.push({ id: row.id, type_id: row.type_id, date: row.date, ordre: row.ordre })
    } else {
      acc.push({
        titre_demarche_id: row.titre_demarche_id,
        etapes: [{ id: row.id, type_id: row.type_id, date: row.date, ordre: row.ordre }],
      })
    }

    return acc
  }, [])

  for (const demarche of toBeMerged) {
    if (demarche.etapes.length === 1) {
      await knex.raw(`UPDATE titres_etapes SET type_id = 'acg' WHERE id = ?`, [demarche.etapes[0].id])
    } else {
      let acgId = demarche.etapes.find(({ type_id }) => type_id === 'acg')?.id ?? null
      if (isNullOrUndefined(acgId)) {
        await knex.raw(`UPDATE titres_etapes SET type_id = 'acg' WHERE id = ?`, [demarche.etapes[0].id])
        acgId = demarche.etapes[0].id
      }

      const etapesAMerger = demarche.etapes.filter(({ id }) => id !== acgId)
      const note = []
      for (const etape of etapesAMerger) {
        await knex.raw(`UPDATE etapes_documents SET description = description || '\n' || 'Document enregistré le ' || ?, etape_id = ? WHERE etape_id = ?`, [etape.date, acgId, etape.id])
        await knex.raw('UPDATE titres_etapes SET etape_fondamentale_id = ? WHERE etape_fondamentale_id = ?', [acgId, etape.id])
        await knex.raw('DELETE FROM titres_etapes WHERE id = ?', [etape.id])
        // @ts-ignore
        note.push(`${OLD_ETAPES_TYPES_NAMES[etape.type_id]} en date du ${etape.date}`)
      }

      // await knex.raw(`UPDATE titres_etapes SET note = note || '\n' || ? WHERE id = ?`, [note.join(`\n`), acgId])
    }
  }
}

export const down = (): void => {}

// FIXME brouillonable ou pas ?
// Est-ce que la liste des statuts est pertinente ?
