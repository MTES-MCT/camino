import { EntrepriseId } from 'camino-common/src/entreprise'
import { EtapeId } from 'camino-common/src/etape'
import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  // migrer titres_titulaires et titres_amodiataires vers titres_etapes
  await knex.raw("ALTER TABLE titres_etapes ADD COLUMN titulaire_ids JSONB DEFAULT '[]'::jsonb NOT NULL")
  await knex.raw("ALTER TABLE titres_etapes ADD COLUMN amodiataire_ids JSONB DEFAULT '[]'::jsonb NOT NULL")

  const titulaires: { rows: { titre_etape_id: EtapeId; entreprise_id: EntrepriseId }[] } = await knex.raw('SELECT titre_etape_id, entreprise_id FROM titres_titulaires')
  const titulairesByEtapeId = titulaires.rows.reduce(
    (acc, { titre_etape_id, entreprise_id }) => {
      if (acc[titre_etape_id] === undefined) {
        acc[titre_etape_id] = []
      }

      acc[titre_etape_id].push(entreprise_id)

      return acc
    },
    {} as Record<string, string[]>
  )

  for (const titreEtapeId in titulairesByEtapeId) {
    await knex.raw('UPDATE titres_etapes SET titulaire_ids = ? WHERE id = ?', [JSON.stringify(titulairesByEtapeId[titreEtapeId]), titreEtapeId])
  }

  const amodiataires: { rows: { titre_etape_id: EtapeId; entreprise_id: EntrepriseId }[] } = await knex.raw('SELECT titre_etape_id, entreprise_id FROM titres_amodiataires')
  const amodiatairesByEtapeId = amodiataires.rows.reduce(
    (acc, { titre_etape_id, entreprise_id }) => {
      if (acc[titre_etape_id] === undefined) {
        acc[titre_etape_id] = []
      }

      acc[titre_etape_id].push(entreprise_id)

      return acc
    },
    {} as Record<string, string[]>
  )

  for (const titreEtapeId in amodiatairesByEtapeId) {
    await knex.raw('UPDATE titres_etapes SET amodiataire_ids = ? WHERE id = ?', [JSON.stringify(amodiatairesByEtapeId[titreEtapeId]), titreEtapeId])
  }

  await knex.schema.dropTable('titres_titulaires')
  await knex.schema.dropTable('titres_amodiataires')

  // rendre obligatoires certaines colonnes d'entreprises et entreprises_etablissements (pour typage)
  await knex.raw('ALTER TABLE entreprises_etablissements ALTER COLUMN date_debut SET NOT NULL')
  await knex.raw('ALTER TABLE entreprises_etablissements ALTER COLUMN nom SET NOT NULL')
  await knex.raw('UPDATE entreprises SET archive = false WHERE archive IS NULL')
  await knex.raw('ALTER TABLE entreprises ALTER COLUMN archive SET NOT NULL')
  await knex.raw('ALTER TABLE entreprises ALTER COLUMN archive SET DEFAULT false')
}

export const down = () => ({})
