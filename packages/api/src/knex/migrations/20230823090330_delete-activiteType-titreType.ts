import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.schema.dropTable('activites_types__titres_types')

  return knex.schema.dropTable('activites_types__pays')
}

export const down = () => ({})
