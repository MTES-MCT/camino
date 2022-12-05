import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('titres_phases', function (table) {
    table.dropForeign('statut_id', 'titresphases_statutid_foreign')
  })
  await knex.schema.alterTable('titres_phases', function (table) {
    table.renameColumn('statut_id', 'phase_statut_id')
  })

  await knex.schema.dropTable('phases_statuts')
}

export const down = () => ({})
