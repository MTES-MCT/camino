import { Knex } from 'knex'
export const up = (knex: Knex) =>
  knex.schema.createTable('caches', table => {
    table.string('id', 128).primary()
    table.jsonb('valeur')
  })

export const down = (knex: Knex) => knex.schema.dropTable('caches')
