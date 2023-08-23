import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  return knex.schema.dropTable('activites_types__titres_types')
}

export const down = () => ({})
