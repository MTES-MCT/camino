import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.schema.dropTable('titres_types__demarches_types__etapes_types')
}

export const down = () => ({})
