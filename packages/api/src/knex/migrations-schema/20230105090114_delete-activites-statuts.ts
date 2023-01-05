import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('titres_activites', function (table) {
    table.dropForeign('statut_id', 'titresactivites_statutid_foreign')
  })
  await knex.schema.alterTable('titres_activites', function (table) {
    table.renameColumn('statut_id', 'activite_statut_id')
  })

  await knex.schema.dropTable('activites_statuts')
}

export const down = () => ({})
