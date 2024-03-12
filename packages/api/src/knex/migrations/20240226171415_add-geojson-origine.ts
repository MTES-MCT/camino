import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('alter table titres_etapes add column geojson_origine_points JSONB')
  await knex.raw('alter table titres_etapes add column geojson_origine_perimetre JSONB')
  await knex.raw('alter table titres_etapes add column geojson_origine_geo_systeme_id varchar')

  await knex.raw(
    'update titres_etapes set geojson_origine_perimetre = concat(\'{"type": "Feature", "properties": {}, "geometry": \', ST_AsGeoJSON(geojson4326_perimetre)::text, \'}\')::json where geojson4326_perimetre is not null'
  )
  await knex.raw("update titres_etapes set geojson_origine_geo_systeme_id = '4326' where geojson4326_perimetre is not null")
  await knex.raw('update titres_etapes set geojson_origine_points = geojson4326_points where geojson4326_points is not null')

  await knex.raw(
    'ALTER TABLE titres_etapes ADD CONSTRAINT perimetre_origine_not_null_when_perimetre_4326_not_null CHECK (("geojson4326_perimetre", "geojson_origine_geo_systeme_id", "geojson_origine_perimetre") IS NULL OR ("geojson4326_perimetre", "geojson_origine_geo_systeme_id", "geojson_origine_perimetre") IS NOT NULL)'
  )

  await knex.raw(
    'ALTER TABLE titres_etapes ADD CONSTRAINT points_origine_not_null_when_points_4326_not_null CHECK (("geojson4326_points", "geojson_origine_points") IS NULL OR ("geojson4326_points", "geojson_origine_points") IS NOT NULL)'
  )
}

export const down = () => ({})
