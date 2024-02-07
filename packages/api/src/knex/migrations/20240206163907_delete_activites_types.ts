import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('ALTER TABLE titres_activites DROP CONSTRAINT titresactivites_typeid_foreign')

  await knex.raw('ALTER TABLE administrations__activites_types__emails DROP CONSTRAINT administrations__activitestypes__emails_activitetypeid_foreign')

  return knex.schema.dropTable('activites_types')
}

export const down = () => ({})
