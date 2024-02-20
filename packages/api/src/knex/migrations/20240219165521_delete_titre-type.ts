import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('ALTER TABLE titres DROP CONSTRAINT titres_typeid_foreign')
  await knex.raw('ALTER TABLE titres DROP column contenus_titre_etapes_ids')
  await knex.schema.dropTable('titres_types')

  return knex.schema.dropTable('titres_types_types')
}

export const down = () => ({})
