import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.dropTable('titres_types__titres_statuts')
}

export const down = () => ({})
