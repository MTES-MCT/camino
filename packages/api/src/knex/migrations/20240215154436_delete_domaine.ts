import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('ALTER TABLE titres_types DROP CONSTRAINT titrestypes_domaineid_foreign')

  return knex.schema.dropTable('domaines')
}

export const down = () => ({})
