import { Knex } from 'knex'
export const up = (knex: Knex) =>
  knex.schema.createTable('definitions', table => {
    table.string('id', 3).primary()
    table.string('nom').notNullable()
    table.string('slug').notNullable()
    table.string('table')
    table.integer('ordre').notNullable()
    table.text('description')
  })

export const down = (knex: Knex) => knex.schema.dropTable('definitions')
