import { Knex } from 'knex'
export const up = (knex: Knex) => knex.schema.dropTable('globales')

export const down = () => ({})
