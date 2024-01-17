/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { z } from 'zod'
import { Pool } from 'pg'
import { GeoSystemeId } from 'camino-common/src/static/geoSystemes.js'
import { FeatureMultiPolygon, MultiPolygon, featureMultiPolygonValidator, multiPolygonValidator } from 'camino-common/src/demarche.js'
import { IGetGeojsonByGeoSystemeIdDbQuery } from './perimetre.queries.types.js'


export const getGeojsonByGeoSystemeId = async (pool: Pool, geoSystemeId: GeoSystemeId, geojson: FeatureMultiPolygon): Promise<FeatureMultiPolygon> => {
  const result = await dbQueryAndValidate(getGeojsonByGeoSystemeIdDb, { geoSystemeId, geojson: JSON.stringify(geojson.geometry) }, pool, z.object({geojson: multiPolygonValidator}))

  if (result.length === 1) {
    const feature: FeatureMultiPolygon = {
        type: 'Feature',
        properties: null,
        geometry: result[0].geojson}
    return featureMultiPolygonValidator.parse(feature)
  }
  throw new Error(`Impossible de convertir le geojson vers le systeme ${geoSystemeId}`)
}

const getGeojsonByGeoSystemeIdDb = sql<Redefine<IGetGeojsonByGeoSystemeIdDbQuery, { geoSystemeId: GeoSystemeId, geojson: string }, {geojson: MultiPolygon}>>`
select ST_AsGeoJSON(ST_Transform(ST_GeomFromGeoJSON($geojson!::text), $geoSystemeId!::integer))::json as geojson LIMIT 1
`
