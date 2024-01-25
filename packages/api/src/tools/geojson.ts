/* eslint-disable sql/no-unsafe-query */
// FIXME remove geojson-rewind et @turf/center

import { knex } from '../knex.js'
import { CommuneId } from 'camino-common/src/static/communes.js'
import { FeatureMultiPolygon } from 'camino-common/src/perimetre.js'

// export const geojsonSurface = async (geojson: Feature<any>) => {
//   const result: { rows: { area: number }[] } = await knex.raw(
//     `select ST_AREA(
//     ST_GeomFromGeoJSON('${JSON.stringify(geojson.geometry)}'), true) as area`
//   )
//   const area = result.rows[0].area

//   // FIXME à faire
//   return Number.parseFloat((area / 1000000).toFixed(2))
// }

export interface GeoJsonResult<T> {
  fallback: boolean
  data: T
}

export const geojsonIntersectsCommunes = async (geojson: FeatureMultiPolygon): Promise<GeoJsonResult<{ id: CommuneId; surface: number }[]>> => {
  let result: { rows: { id: CommuneId; surface: string }[] }
  let fallback = false
  try {
    result = await knex.raw(
      `select communes_postgis.id,
                ST_Area(ST_INTERSECTION(ST_GeomFromGeoJSON('${JSON.stringify(geojson.geometry)}'), communes_postgis.geometry), true) as surface
         from communes_postgis
         where ST_INTERSECTS(ST_GeomFromGeoJSON('${JSON.stringify(geojson.geometry)}'), communes_postgis.geometry) is true`
    )
  } catch (e) {
    fallback = true
    result = await knex.raw(
      `select communes_postgis.id,
                ST_Area(ST_INTERSECTION(ST_MAKEVALID(ST_GeomFromGeoJSON('${JSON.stringify(geojson.geometry)}')), communes_postgis.geometry), true) as surface
         from communes_postgis
         where ST_INTERSECTS(ST_MAKEVALID(ST_GeomFromGeoJSON('${JSON.stringify(geojson.geometry)}')), communes_postgis.geometry) is true`
    )
  }

  return {
    fallback,
    data: result.rows.map(row => ({
      id: row.id,
      surface: Number.parseInt(row.surface),
    })),
  }
}
