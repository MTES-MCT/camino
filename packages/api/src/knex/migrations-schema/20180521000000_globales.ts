import { Knex } from 'knex'

export const up = (knex: Knex) =>
  knex.schema.createTable('globales', table => {
    table.string('id').primary()
    table.boolean('valeur').notNullable()
  })

export const down = (knex: Knex) => knex.schema.dropTable('globales')
