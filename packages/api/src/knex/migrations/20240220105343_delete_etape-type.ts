import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('ALTER TABLE titres_etapes DROP CONSTRAINT titresetapes_typeid_foreign')

  return knex.schema.dropTable('etapes_types')
}

export const down = () => ({})
