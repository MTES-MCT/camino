/* eslint-disable sql/no-unsafe-query */
import { EtapeId, etapeIdValidator } from 'camino-common/src/etape'
import { FeatureCollectionPoints, FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { GeoSystemeId, geoSystemeIdValidator } from 'camino-common/src/static/geoSystemes'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'
import knexBuilder from 'knex'
import { knexSnakeCaseMappers } from 'objection'
import { z } from 'zod'

export const knexConfig = {
  client: 'pg',
  connection: {
    host: 'localhost',
    port: 5432,
    database: 'camino2',
    user: 'postgres',
    password: 'password',
  },
  ...knexSnakeCaseMappers(),
}

const knex = knexBuilder(knexConfig)

const entry = z.object({
  coordonnees: z.object({ x: z.number(), y: z.number() }),
  geo_systeme_id: geoSystemeIdValidator,
  titre_etape_id: etapeIdValidator,
  groupe: z.number(),
  contour: z.number(),
  point: z.number(),
  nom: z.string().nullable(),
  description: z.string().nullable(),
})

type Row = z.infer<typeof entry>

const etapeIdsIgnored: string[] = [
  // un seul point opposable
  'ib3azhoNoXQHxd1Bnumak5ww',
  // le contour commence à 2
  'FixGOMcVwkauQyH1byBKpglp',
  // Devrait être plusieurs polygones
  'h4XRWr88Xa0YDMjPe3gVdhCd',
  'IXHTQEu5EX5QYqUzHV1tugjp',
  'mXvPgzER5mj3gLKnM0lLMs8R',
  'pTPoON8dWU4r4ylo8kerDNNe',
  'yBNXGAeopu8yFmM6LqbpnFtt',
  // Les points sont surement pas le bon ordre
  'IlwGuEUZwB3rS5ydlzsg8l6T',
  'VMXNEznTgy8bVNyJIOJWRHZS',
  // Il manque une lacune
  'LmNB8aPDs9u2Z9861AfL5fUW',
  // Pas bon geosysteme 27573
  'Nfd0MiVO16xmUL7OyRGaMMgJ',
]

const generate = async () => {
  const pointsReferences: { rows: Row[] } = await knex.raw(
    `select tpr.coordonnees, tpr.geo_systeme_id, tp.titre_etape_id, tp.groupe, tp.contour, tp.point, tp.nom, tp.description from titres_points_references tpr join titres_points tp on tp.id = tpr.titre_point_id where tpr.opposable is true and tpr.geo_systeme_id != '4326' and tp.titre_etape_id not in (${etapeIdsIgnored
      .map(id => `'${id}'`)
      .join(', ')}) order by titre_etape_id, groupe, contour, point`
  )

  const points = z.array(entry).parse(pointsReferences.rows)

  const pointsByEtape = points.reduce<Record<EtapeId, Row[]>>((acc, point) => {
    if (isNullOrUndefined(acc[point.titre_etape_id])) {
      acc[point.titre_etape_id] = []
    }

    acc[point.titre_etape_id].push(point)

    return acc
  }, {})

  for (const points of Object.values(pointsByEtape)) {
    const origineGeosystemeId: GeoSystemeId = points[0].geo_systeme_id

    const originePoints: FeatureCollectionPoints = {
      type: 'FeatureCollection',
      features: points.map(point => ({
        type: 'Feature',
        properties: { nom: point.nom?.replace(/'/g, '’'), description: point.description?.replace(/'/g, '’') },
        geometry: { type: 'Point', coordinates: [point.coordonnees.x, point.coordonnees.y] },
      })),
    }

    const originePerimetre: FeatureMultiPolygon = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiPolygon',
        coordinates: points.reduce<[number, number][][][]>((acc, point) => {
          if (acc.length < point.groupe) {
            acc.push([])
          }

          if (acc[point.groupe - 1].length < point.contour) {
            acc[point.groupe - 1].push([])
          }

          acc[point.groupe - 1][point.contour - 1][point.point - 1] = [point.coordonnees.x, point.coordonnees.y]
          acc[point.groupe - 1][point.contour - 1][point.point] = acc[point.groupe - 1][point.contour - 1][0]

          return acc
        }, []),
      },
    }

    const result: { rows: { result: boolean }[] } = await knex.raw(
      `select ST_ISVALID(ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(originePerimetre.geometry)}'), ${origineGeosystemeId}))) as result`
    )

    if (!result.rows[0].result) {
      console.error(`étape invalide ${points[0].titre_etape_id}`, origineGeosystemeId, JSON.stringify(originePerimetre))
      throw new Error('boom')
    } else {
      const sqlQuery = `update titres_etapes set geojson_origine_geo_systeme_id = '${origineGeosystemeId}', geojson_origine_points = '${JSON.stringify(
        originePoints
      )}', geojson_origine_perimetre = '${JSON.stringify(originePerimetre)}'  where id='${points[0].titre_etape_id}';`

      console.info(sqlQuery)
    }
  }
}

generate()
  .then(() => {
    process.exit(0)
  })
  .catch(e => {
    console.error(e)

    process.exit(1)
  })
