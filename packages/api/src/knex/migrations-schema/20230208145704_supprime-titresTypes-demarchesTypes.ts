import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  return knex.schema.dropTable('titres_types__demarches_types')
}

export const down = () => ({})
