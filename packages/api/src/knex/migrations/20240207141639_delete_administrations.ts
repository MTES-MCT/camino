import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('ALTER TABLE administrations__activites_types__emails DROP CONSTRAINT administrations__activitestypes__emails_administrationid_foreig')
  await knex.raw('ALTER TABLE utilisateurs DROP CONSTRAINT utilisateurs_administrationid_foreign')

  return knex.schema.dropTable('administrations')
}

export const down = () => ({})
