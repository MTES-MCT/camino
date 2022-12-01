import { Knex } from 'knex'
export const up = (knex: Knex) =>
  knex.schema.alterTable('administrations', function (table) {
    table.dropColumns('departement_id', 'region_id', 'type_id')
  })

export const down = () => ({})
