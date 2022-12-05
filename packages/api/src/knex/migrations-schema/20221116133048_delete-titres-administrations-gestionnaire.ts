import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  return knex.schema.dropTable('titres_administrations_gestionnaires')
}

export const down = () => ({})
