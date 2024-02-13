import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('ALTER TABLE titres_demarches DROP CONSTRAINT titresdemarches_typeid_foreign')

  return knex.schema.dropTable('demarches_types')
}

export const down = () => ({})
