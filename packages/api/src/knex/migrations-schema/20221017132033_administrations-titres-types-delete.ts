import { Knex } from 'knex'
export const up = async (knex: Knex) => knex.schema.dropTable('administrations__titresTypes')

export const down = () => ({})
