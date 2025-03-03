import { CaminoDate } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeDocumentId, EtapeId } from 'camino-common/src/etape'
import { DOCUMENTS_TYPES_IDS, DocumentsTypes, DocumentTypeId } from 'camino-common/src/static/documentsTypes'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { isNotNullNorUndefined, isNullOrUndefined, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { Knex } from 'knex'
import { LargeObjectId } from '../../database/largeobjects'
import { AVIS_TYPES, AvisStatutId, AvisVisibilityIds } from 'camino-common/src/static/avisTypes'
import { ETAPES_STATUTS, EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { newEtapeAvisId } from '../../database/models/_format/id-create'

const OLD_ETAPES_TYPES_NAMES = {
  scg: "saisine du conseil général de l'économie (CGE)",
  rcg: "rapport du conseil général de l'économie (CGE)",
} as const

const convertEtapeStatutToAvisStatut = (etapeStatutId: EtapeStatutId): AvisStatutId | null =>
  etapeStatutId === ETAPES_STATUTS.FAVORABLE
    ? 'Favorable'
    : etapeStatutId === ETAPES_STATUTS.FAVORABLE_AVEC_RESERVE
      ? 'Favorable avec réserves'
      : etapeStatutId === ETAPES_STATUTS.EXEMPTE
        ? 'Exempté'
        : etapeStatutId === ETAPES_STATUTS.REQUIS
          ? 'Requis'
          : etapeStatutId === ETAPES_STATUTS.DEFAVORABLE
            ? 'Défavorable'
            : null

export const up = async (knex: Knex): Promise<void> => {
  const { rows }: { rows: { id: EtapeId; titre_demarche_id: DemarcheId; type_id: EtapeTypeId; ordre: number; date: CaminoDate; statut_id: EtapeStatutId }[] } =
    await knex.raw(`SELECT te.id, te.titre_demarche_id, te.type_id, te.ordre, te.date, te.statut_id
  FROM titres_etapes te WHERE te.type_id IN ('acg', 'scg', 'rcg') AND te.archive IS FALSE
  ORDER BY te.titre_demarche_id ASC, te.ordre ASC`)

  const toBeMerged = rows.reduce<{ titre_demarche_id: DemarcheId; etapes: { id: EtapeId; type_id: EtapeTypeId; statut_id: EtapeStatutId; date: CaminoDate; ordre: number }[] }[]>((acc, row) => {
    const demarchePrecedente = acc.slice(-1)[0]
    const etapePrecedente = isNotNullNorUndefined(demarchePrecedente) ? (demarchePrecedente.etapes.slice(-1)[0] ?? null) : null
    if (isNotNullNorUndefined(etapePrecedente) && demarchePrecedente.titre_demarche_id === row.titre_demarche_id && etapePrecedente.ordre === row.ordre - 1) {
      demarchePrecedente.etapes.push(row)
    } else {
      acc.push({
        titre_demarche_id: row.titre_demarche_id,
        etapes: [row],
      })
    }

    return acc
  }, [])

  for (const demarche of toBeMerged) {
    if (demarche.etapes.length === 1) {
      const etape = demarche.etapes[0]

      // algo :
      // Si scg --> update du type de l'étape
      // Sinon si ACG/RCG --> pour chaque document (non autre document), créer un etape_avis avec le statut de l'ACG puis update du type de l'étape
      if (['acg', 'rcg'].includes(etape.type_id)) {
        const documents: {
          rows: { id: EtapeDocumentId; etape_document_type_id: DocumentTypeId; description: string; public_lecture: boolean; entreprises_lecture: boolean; largeobject_id: LargeObjectId }[]
        } = await knex.raw('SELECT * FROM etapes_documents WHERE etape_id = ?', [etape.id])

        if (isNullOrUndefinedOrEmpty(documents.rows)) {
          const id = newEtapeAvisId(etape.type_id === 'acg' ? AVIS_TYPES.avisDuConseilGeneralDeLEconomie : AVIS_TYPES.autreAvis)
          await knex.raw('INSERT INTO etape_avis(id, avis_type_id, avis_statut_id, avis_visibility_id, etape_id, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)', [
            id,
            etape.type_id === 'acg' ? AVIS_TYPES.avisDuConseilGeneralDeLEconomie : AVIS_TYPES.autreAvis,
            convertEtapeStatutToAvisStatut(etape.statut_id),
            AvisVisibilityIds.Administrations,
            etape.id,
            // @ts-ignore
            `${OLD_ETAPES_TYPES_NAMES[etape.type_id] ?? ''}`,
            etape.date,
          ])
        } else {
          for (const document of documents.rows) {
            await knex.raw('INSERT INTO etape_avis(id, avis_type_id, avis_statut_id, avis_visibility_id, etape_id, description, date, largeobject_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
              document.id,
              document.etape_document_type_id === DOCUMENTS_TYPES_IDS.avisDuConseilGeneralDeLEconomie_cge ? AVIS_TYPES.avisDuConseilGeneralDeLEconomie : AVIS_TYPES.autreAvis,
              convertEtapeStatutToAvisStatut(etape.statut_id),
              document.public_lecture ? AvisVisibilityIds.Public : document.entreprises_lecture ? AvisVisibilityIds.TitulairesEtAdministrations : AvisVisibilityIds.Administrations,
              etape.id,
              document.description + `\n${DocumentsTypes[document.etape_document_type_id].nom}`,
              etape.date,
              document.largeobject_id,
            ])
          }
        }

        await knex.raw('DELETE FROM etapes_documents WHERE etape_id = ?', [etape.id])
      }

      await knex.raw(`UPDATE titres_etapes SET type_id = 'acg', statut_id = 'fai' WHERE id = ?`, [etape.id])
    } else {
      let acgId = demarche.etapes.find(({ type_id }) => type_id === 'acg')?.id ?? null
      if (isNullOrUndefined(acgId)) {
        acgId = demarche.etapes[0].id
      }
      await knex.raw(`UPDATE titres_etapes SET type_id = 'acg', statut_id = 'fai' WHERE id = ?`, [acgId])

      const etapesAvecDocumentsAMigrer = demarche.etapes.filter(({ type_id }) => ['acg', 'rcg'].includes(type_id))
      for (const etape of etapesAvecDocumentsAMigrer) {
        const documents: {
          rows: { id: EtapeDocumentId; etape_document_type_id: DocumentTypeId; description: string; public_lecture: boolean; entreprises_lecture: boolean; largeobject_id: LargeObjectId }[]
        } = await knex.raw('SELECT * FROM etapes_documents WHERE etape_id = ?', [etape.id])

        if (isNullOrUndefinedOrEmpty(documents.rows)) {
          const id = newEtapeAvisId(etape.type_id === 'acg' ? AVIS_TYPES.avisDuConseilGeneralDeLEconomie : AVIS_TYPES.autreAvis)
          await knex.raw('INSERT INTO etape_avis(id, avis_type_id, avis_statut_id, avis_visibility_id, etape_id, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)', [
            id,
            etape.type_id === 'acg' ? AVIS_TYPES.avisDuConseilGeneralDeLEconomie : AVIS_TYPES.autreAvis,
            convertEtapeStatutToAvisStatut(etape.statut_id),
            AvisVisibilityIds.Administrations,
            acgId,
            // @ts-ignore
            `${OLD_ETAPES_TYPES_NAMES[etape.type_id] ?? ''}`,
            etape.date,
          ])
        } else {
          for (const document of documents.rows) {
            await knex.raw('INSERT INTO etape_avis(id, avis_type_id, avis_statut_id, avis_visibility_id, etape_id, description, date, largeobject_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
              document.id,
              document.etape_document_type_id === DOCUMENTS_TYPES_IDS.avisDuConseilGeneralDeLEconomie_cge ? AVIS_TYPES.avisDuConseilGeneralDeLEconomie : AVIS_TYPES.autreAvis,
              convertEtapeStatutToAvisStatut(etape.statut_id),
              document.public_lecture ? AvisVisibilityIds.Public : document.entreprises_lecture ? AvisVisibilityIds.TitulairesEtAdministrations : AvisVisibilityIds.Administrations,
              acgId,
              document.description + `\n${DocumentsTypes[document.etape_document_type_id].nom}`,
              etape.date,
              document.largeobject_id,
            ])
          }
        }

        await knex.raw('DELETE FROM etapes_documents WHERE etape_id = ?', [etape.id])
      }

      // @ts-ignore
      const scg = demarche.etapes.filter(({ id, type_id }) => type_id === 'scg' && id !== acgId)
      for (const etape of scg) {
        await knex.raw('UPDATE etapes_documents SET etape_id = ? WHERE etape_id = ?', [acgId, etape.id])
      }

      for (const etapeId of demarche.etapes.filter(({ id }) => id !== acgId).map(({ id }) => id)) {
        await knex.raw('UPDATE titres_etapes SET etape_fondamentale_id = ? WHERE etape_fondamentale_id = ?', [acgId, etapeId])
        await knex.raw(`DELETE FROM titres_etapes WHERE id = ?`, [etapeId])
      }

      // await knex.raw(`UPDATE titres_etapes SET note = note || '\n' || ? WHERE id = ?`, [note.join(`\n`), acgId])
    }
  }
}

export const down = (): void => {}

// Est-ce que la liste des statuts est pertinente ?
