import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('ALTER TABLE documents DROP CONSTRAINT documents_typeid_foreign')

  return knex.schema.dropTable('documents_types')
}

export const down = () => ({})
