import { Knex } from 'knex'
export const up = (knex: Knex) =>
  knex.schema.alterTable('titres_demarches', function (table) {
    table.string('description').nullable()
  })

export const down = () => ({})
