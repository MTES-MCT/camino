/* eslint-disable sql/no-unsafe-query */
// FIXME remove geojson-rewind et @turf/center
import rewind from 'geojson-rewind'
import center from '@turf/center'

import { ITitrePoint } from '../types.js'
import { knex } from '../knex.js'
import { Feature } from 'geojson'
import { CommuneId } from 'camino-common/src/static/communes.js'
import { FeatureMultiPolygon, featureMultiPolygonValidator } from 'camino-common/src/perimetre.js'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools.js'

// convertit des points
// en un geojson de type 'MultiPolygon'

export const geojsonFeatureMultiPolygon = (points: Pick<ITitrePoint, 'groupe' | 'contour' | 'coordonnees' | 'point'>[]): FeatureMultiPolygon => {
  const feature: FeatureMultiPolygon = {
    type: 'Feature',
    properties: {},
    geometry: rewind(
      {
        type: 'MultiPolygon',
        coordinates: geojsonMultiPolygonCoordinates(points),
      },
      false
    ),
  }

  return featureMultiPolygonValidator.parse(feature)
}



// convertit une liste de points
// en un tableau 'coordinates' geoJson
// (le premier et le dernier point d'un contour ont les mêmes coordonnées)
const geojsonMultiPolygonCoordinates = (points: Pick<ITitrePoint, 'groupe' | 'contour' | 'coordonnees' | 'point'>[]) => multiPolygonContoursClose(multiPolygonCoordinates(points))

// convertit une liste de points
// [{groupe: 1, contour: 1, point: 1, coordonnees: {x: 1.111111, y: 1.111111}}]
// en un tableau de 'coordinates': [[[[1.11111, 1.111111]]]]
const multiPolygonCoordinates = (points: Pick<ITitrePoint, 'groupe' | 'contour' | 'coordonnees' | 'point'>[]): [number, number][][][] =>
  points.reduce((res: [number, number][][][], p) => {
    res[p.groupe - 1] = isNotNullNorUndefinedNorEmpty(res[p.groupe - 1]) ? res[p.groupe - 1] : []
    res[p.groupe - 1][p.contour - 1] = isNotNullNorUndefinedNorEmpty(res[p.groupe - 1][p.contour - 1]) ? res[p.groupe - 1][p.contour - 1] : []
    res[p.groupe - 1][p.contour - 1][p.point - 1] = [p.coordonnees.x, p.coordonnees.y]

    return res
  }, [])

// duplique le premier point de chaque contour
// en fin de contour pour fermer le tracé
const multiPolygonContoursClose = (groupes: [number, number][][][]): [number, number][][][] =>
  groupes.map(contours =>
    contours.reduce((acc: [number, number][][], points) => {
      points[points.length] = points[0]
      acc.push(points)

      return acc
    }, [])
  )

export const geojsonCenter = (points: ITitrePoint[]) => {
  const geojson = geojsonFeatureMultiPolygon(points)

  return center(geojson).geometry.coordinates
}

export const geojsonSurface = async (geojson: Feature<any>) => {
  const result: { rows: { area: number }[] } = await knex.raw(
    `select ST_AREA(
    ST_GeomFromGeoJSON('${JSON.stringify(geojson.geometry)}'), true) as area`
  )
  const area = result.rows[0].area

  return Number.parseFloat((area / 1000000).toFixed(2))
}

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
