import { EtapeId } from 'camino-common/src/etape'
import { CommuneId } from 'camino-common/src/static/communes'
import { toDepartementId } from 'camino-common/src/static/departement'
import { getDepartementsBySecteurs, SecteursMaritimes } from 'camino-common/src/static/facades'
import { onlyUnique, toSorted } from 'camino-common/src/typescript-tools'
import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw("ALTER TABLE titres_etapes ADD COLUMN departements JSONB NOT NULL DEFAULT '[]'::jsonb")
  await knex.raw('CREATE INDEX titres_etapes_departements_index ON titres_etapes USING gin(departements)')
  const rows: { rows: { id: EtapeId; secteurs_maritime: SecteursMaritimes[]; communes: { id: CommuneId }[] }[] } = await knex.raw(
    'SELECT id, secteurs_maritime, communes FROM titres_etapes WHERE jsonb_array_length(secteurs_maritime) > 0 OR jsonb_array_length(communes) > 0'
  )

  for (const etape of rows.rows) {
    await knex.raw('UPDATE titres_etapes SET departements = ? WHERE id = ?', [
      JSON.stringify(toSorted([...getDepartementsBySecteurs(etape.secteurs_maritime), ...etape.communes.map(c => toDepartementId(c.id))].filter(onlyUnique))),
      etape.id,
    ])
  }
}

export const down = (): void => {}
