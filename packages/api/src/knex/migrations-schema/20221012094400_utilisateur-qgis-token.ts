import { Knex } from 'knex'
export const up = (knex: Knex) =>
  knex.schema.alterTable('utilisateurs', function (table) {
    table.string('qgis_token').index()
  })

export const down = () => ({})
