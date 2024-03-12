import { Knex } from 'knex'

export const up = async (knex: Knex) => {


  await knex.raw('alter table titres_etapes add column geojson4326_forages JSONB')
  await knex.raw('alter table titres_etapes add column geojson_origine_forages JSONB')

  await knex.raw(
    'ALTER TABLE titres_etapes ADD CONSTRAINT forages_origine_not_null_when_forages4326_not_null CHECK (("geojson4326_forages", "geojson_origine_forages") IS NULL OR ("geojson4326_forages", "geojson_origine_forages") IS NOT NULL)'
  )
}

export const down = () => ({})
