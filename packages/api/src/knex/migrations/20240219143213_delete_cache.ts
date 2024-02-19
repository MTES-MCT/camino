import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  return knex.schema.dropTable('caches')
}

export const down = () => ({})
