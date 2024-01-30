/* eslint-disable sql/no-unsafe-query */
import { Knex } from 'knex'
import { EtapeId } from 'camino-common/src/etape.js'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools.js'
import rewind from 'geojson-rewind'
import { FeatureMultiPolygon, featureMultiPolygonValidator } from 'camino-common/src/perimetre.js'

const etapesToNotMigrate = ['0NmsqYGVQJYKhFY22Ltt4NBV']

interface IGeoJson {
  type: string
  geometry?: NonNullable<unknown> | null
  bbox?: number[] | null
  properties: NonNullable<unknown> | null
  features?: IGeoJson[] | null
}

const geojsonFeatureMultiPolygon = (points: any[]): FeatureMultiPolygon => {
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
const geojsonMultiPolygonCoordinates = (points: any[]) => multiPolygonContoursClose(multiPolygonCoordinates(points))

// convertit une liste de points
// [{groupe: 1, contour: 1, point: 1, coordonnees: {x: 1.111111, y: 1.111111}}]
// en un tableau de 'coordinates': [[[[1.11111, 1.111111]]]]
const multiPolygonCoordinates = (points: any[]): [number, number][][][] =>
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

// convertit des points
// en un geojson de type 'FeatureCollection' de 'Points'
const geojsonFeatureCollectionPoints = (points: any[]): IGeoJson => ({
  type: 'FeatureCollection',
  properties: {},
  features: points.map(p => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [p.coordonnees.x, p.coordonnees.y],
    },
    properties: {
      nom: p.nom,
      description: p.description,
    },
  })),
})

export const up = async (knex: Knex) => {
  await knex.raw('alter table titres_etapes add column geojson4326_perimetre public.geometry(MultiPolygon,4326)')
  await knex.raw('alter table titres_etapes add column geojson4326_points JSONB')

  const etapes: { rows: { id: EtapeId; heritage_props: { points?: any; surface?: any; perimetre?: any } | null }[] } = await knex.raw('select * from titres_etapes')

  for (const etape of etapes.rows) {
    if (!etapesToNotMigrate.includes(etape.id)) {
      const points: { rows: any[] } = await knex.raw('select * from titres_points where titre_etape_id = ?', [etape.id])

      if (isNotNullNorUndefinedNorEmpty(points.rows)) {
        const geojsonPoints = geojsonFeatureCollectionPoints(points.rows)

        await knex.raw(
          `update titres_etapes set geojson4326_perimetre = ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(
            geojsonFeatureMultiPolygon(points.rows).geometry
          )}'), 4326), geojson4326_points = ?::jsonb where id = ?`,
          [JSON.stringify(geojsonPoints), etape.id]
        )

        await knex.raw('select ST_Centroid(te.geojson4326_perimetre) from titres_etapes te  where te.id = ?', [etape.id])
      }
    }

    if (isNotNullNorUndefined(etape.heritage_props)) {
      delete etape.heritage_props.surface

      if ('points' in etape.heritage_props) {
        etape.heritage_props.perimetre = etape.heritage_props.points
        delete etape.heritage_props.points
      }

      await knex.raw(`update titres_etapes set heritage_props = ? where id = ?`, [etape.heritage_props, etape.id])
    }
  }

  // FIXME migrer les titres_points_references
  // FIXME ajouter des index
  // FIXME supprimer la colonne description quand tout est vide
  // await knex.raw('alter table titres drop column coordonnees')
  // await knex.raw('drop table titres_points_references')
  // await knex.raw('drop table titres_points')
}

export const down = () => ({})
