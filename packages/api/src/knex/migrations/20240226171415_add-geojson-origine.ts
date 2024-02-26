import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  
  await knex.raw('alter table titres_etapes add column geojson_origine_points JSONB')
  await knex.raw('alter table titres_etapes add column geojson_origine_perimetre JSONB')
  await knex.raw('alter table titres_etapes add column geojson_origine_geo_systeme_id varchar')


  // FIXME 2024-02-26 une fois ça joué, il faut lancer le script pour récupérer toutes les données qui sont dans l'ancienne base
  await knex.raw('update titres_etapes set geojson_origine_perimetre = concat(\'{"type": "Feature", "properties": {}, "geometry": \', ST_AsGeoJSON(geojson4326_perimetre)::text, \'}\')::json where geojson4326_perimetre is not null')
  await knex.raw("update titres_etapes set geojson_origine_geo_systeme_id = '4326' where geojson4326_perimetre is not null")
  await knex.raw("update titres_etapes set geojson_origine_points = geojson4326_points where geojson4326_points is not null")
  
}

export const down = () => ({})
