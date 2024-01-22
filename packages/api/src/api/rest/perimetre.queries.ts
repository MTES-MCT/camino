/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { z } from 'zod'
import { Pool } from 'pg'
import { GeoSysteme, GeoSystemes, TransformableGeoSystemeId } from 'camino-common/src/static/geoSystemes.js'
import { FeatureMultiPolygon, MultiPolygon, featureMultiPolygonValidator, multiPolygonValidator } from 'camino-common/src/demarche.js'
import { IGetGeojsonByGeoSystemeIdDbQuery } from './perimetre.queries.types.js'

const precision = {
  met: 0.001,
  deg: 0.0001,
  gon: 0.0001,
} as const satisfies Record<GeoSysteme['uniteId'], number>

export const getGeojsonByGeoSystemeId = async (pool: Pool, geoSystemeId: TransformableGeoSystemeId, geojson: FeatureMultiPolygon): Promise<FeatureMultiPolygon> => {
  if (geoSystemeId === '4326') {
    return geojson
  }
  const result = await dbQueryAndValidate(
    getGeojsonByGeoSystemeIdDb,
    { geoSystemeId, geojson: JSON.stringify(geojson.geometry), precision: precision[GeoSystemes[geoSystemeId].uniteId] },
    pool,
    z.object({ geojson: multiPolygonValidator })
  )

  if (result.length === 1) {
    const feature: FeatureMultiPolygon = {
      type: 'Feature',
      properties: null,
      geometry: result[0].geojson,
    }

    return featureMultiPolygonValidator.parse(feature)
  }
  throw new Error(`Impossible de convertir le geojson vers le systeme ${geoSystemeId}`)
}

// ST_ReducePrecision change de Multipolygon à Polygon :scream:
const getGeojsonByGeoSystemeIdDb = sql<Redefine<IGetGeojsonByGeoSystemeIdDbQuery, { geoSystemeId: TransformableGeoSystemeId; geojson: string; precision: number }, { geojson: MultiPolygon }>>`
select
    ST_AsGeoJSON (ST_Multi (ST_ReducePrecision (ST_Transform (ST_GeomFromGeoJSON ($ geojson !::text), $ geoSystemeId !::integer), $ precision !)))::json as geojson
LIMIT 1
`


const getGeojsonInfoDb = sql<>`
select

LIMIT 1
`