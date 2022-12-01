import { Knex } from 'knex'
export const up = (knex: Knex) => knex.schema.dropTable('definitions')

export const down = () => ({})
