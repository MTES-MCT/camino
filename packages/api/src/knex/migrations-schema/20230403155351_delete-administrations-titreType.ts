import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.schema.dropTable('administrations__titresTypes__titresStatuts')

  return knex.schema.dropTable('administrations__titresTypes__etapesTypes')
}

export const down = () => ({})
