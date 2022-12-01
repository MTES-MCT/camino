import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('titres_etapes', function (table) {
    table.dropForeign('statut_id', 'titresetapes_statutid_foreign')
  })
  await knex.schema.dropTable('etapes_types__etapes_statuts')
  await knex.schema.dropTable('etapes_statuts')
}

export const down = () => ({})
