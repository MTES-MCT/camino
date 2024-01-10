import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw("ALTER TABLE titres_etapes ALTER COLUMN sdom_zones SET DEFAULT '[]'::jsonb")
  await knex.raw("update titres_etapes set sdom_zones='[]'::jsonb where sdom_zones is null")
  await knex.raw('ALTER TABLE titres_etapes ALTER COLUMN sdom_zones SET NOT NULL')

  await knex.raw("ALTER TABLE titres_etapes ALTER COLUMN administrations_locales SET DEFAULT '[]'::jsonb")
  await knex.raw("update titres_etapes set administrations_locales='[]'::jsonb where administrations_locales is null")
  await knex.raw('ALTER TABLE titres_etapes ALTER COLUMN administrations_locales SET NOT NULL')

  await knex.raw("ALTER TABLE titres_etapes ALTER COLUMN secteurs_maritime SET DEFAULT '[]'::jsonb")
  await knex.raw("update titres_etapes set secteurs_maritime='[]'::jsonb where secteurs_maritime is null")
  await knex.raw('ALTER TABLE titres_etapes ALTER COLUMN secteurs_maritime SET NOT NULL')
}

export const down = () => ({})
