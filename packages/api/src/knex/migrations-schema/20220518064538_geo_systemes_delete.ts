import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  return knex.schema.dropTable('geo_systemes')
}

export const down = () => ({})
