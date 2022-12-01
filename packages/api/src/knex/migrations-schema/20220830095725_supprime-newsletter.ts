import { Knex } from 'knex'
export const up = (knex: Knex) =>
  knex.schema.alterTable('utilisateurs', table => {
    table.dropColumn('newsletter')
  })

export const down = () => ({})
