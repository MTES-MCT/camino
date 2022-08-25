import rewind from 'geojson-rewind'
import center from '@turf/center'

import { IGeometry, ITitrePoint } from '../types'
import { Feature } from '@turf/helpers'
import { knex } from '../knex'

// convertit des points
// en un geojson de type 'MultiPolygon'

export const geojsonFeatureMultiPolygon = (points: ITitrePoint[]) => ({
  type: 'Feature',
  properties: { etapeId: points[0].titreEtapeId },
  coordinates: [],
  geometry: rewind(
    {
      type: 'MultiPolygon',
      coordinates: geojsonMultiPolygonCoordinates(points)
    },
    false
  ) as IGeometry
})

// convertit des points
// en un geojson de type 'FeatureCollection' de 'Points'

export const geojsonFeatureCollectionPoints = (points: ITitrePoint[]) => ({
  type: 'FeatureCollection',
  properties: { etapeId: points[0].titreEtapeId },
  features: points.map(p => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [p.coordonnees.x, p.coordonnees.y]
    },
    properties: {
      id: p.id,
      groupe: p.groupe,
      contour: p.contour,
      point: p.point,
      nom: p.nom,
      description: p.description,
      references: p.references
    }
  }))
})

// convertit une liste de points
// en un tableau 'coordinates' geoJson
// (le premier et le dernier point d'un contour ont les mêmes coordonnées)
const geojsonMultiPolygonCoordinates = (points: ITitrePoint[]) =>
  multiPolygonContoursClose(multiPolygonCoordinates(points))

// convertit une liste de points
// [{groupe: 1, contour: 1, point: 1, coordonnees: {x: 1.111111, y: 1.111111}}]
// en un tableau de 'coordinates': [[[[1.11111, 1.111111]]]]
const multiPolygonCoordinates = (points: ITitrePoint[]) =>
  points.reduce((res: number[][][][], p) => {
    res[p.groupe - 1] = res[p.groupe - 1] || []
    res[p.groupe - 1][p.contour - 1] = res[p.groupe - 1][p.contour - 1] || []
    res[p.groupe - 1][p.contour - 1][p.point - 1] = [
      p.coordonnees.x,
      p.coordonnees.y
    ]

    return res
  }, [])

// duplique le premier point de chaque contour
// en fin de contour pour fermer le tracé
const multiPolygonContoursClose = (groupes: number[][][][]) =>
  groupes.map(contours =>
    contours.reduce((acc: number[][][], points) => {
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

export const geojsonIntersectsSDOM = async (geojson: Feature<any>) => {
  const result: { rows: { id: string }[] } = await knex.raw(
    `select sdom_zones.id from sdom_zones 
           where ST_INTERSECTS(ST_GeomFromGeoJSON('${JSON.stringify(
             geojson.geometry
           )}'), sdom_zones.geometry) is true`
  )

  return result.rows.map(({ id }) => id)
}

export const geojsonIntersectsForets = async (geojson: Feature<any>) => {
  const result: { rows: { id: string }[] } = await knex.raw(
    `select forets.id from forets 
           where ST_INTERSECTS(ST_GeomFromGeoJSON('${JSON.stringify(
             geojson.geometry
           )}'), forets.geometry) is true`
  )

  return result.rows.map(({ id }) => id)
}

export const geojsonIntersectsCommunes = async (
  geojson: Feature<any>
): Promise<{ id: string; surface: number }[]> => {
  const result: { rows: { id: string; surface: number }[] } = await knex.raw(
    `select communes.id, ST_Area(ST_INTERSECTION(ST_GeomFromGeoJSON('${JSON.stringify(
      geojson.geometry
    )}'), communes.geometry), true) as surface from communes
           where ST_INTERSECTS(ST_GeomFromGeoJSON('${JSON.stringify(
             geojson.geometry
           )}'), communes.geometry) is true`
  )

  return result.rows
}
