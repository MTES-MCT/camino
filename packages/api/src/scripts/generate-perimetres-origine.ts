import { EtapeId, etapeIdValidator } from 'camino-common/src/etape'
import { FeatureCollectionPoints, FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { GeoSystemeId, TransformableGeoSystemeId, geoSystemeIdValidator } from 'camino-common/src/static/geoSystemes'
import {default as knexBuilder} from 'knex'
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
  coordonnees: z.object({x: z.number(), y: z.number()}),
  'geo_systeme_id': geoSystemeIdValidator,
  'titre_etape_id': etapeIdValidator,
  'groupe': z.number(),
  'contour': z.number(),
  'point': z.number(),
  'nom': z.string().nullable(),
  'description': z.string().nullable()
})

type Row = z.infer<typeof entry>
const generate = async () => {
  const pointsReferences: {rows: Row[]} = await knex.raw("select tpr.coordonnees, tpr.geo_systeme_id, tp.titre_etape_id, tp.groupe, tp.contour, tp.point, tp.nom, tp.description from titres_points_references tpr join titres_points tp on tp.id = tpr.titre_point_id where tpr.opposable is true and tpr.geo_systeme_id != '4326' order by titre_etape_id, groupe, contour, point")

  
  const points = z.array(entry).parse(pointsReferences.rows)

  const pointsByEtape = points.reduce< Record<EtapeId, Row[]>>((acc, point) => {

    if( !acc[point.titre_etape_id]){
      acc[point.titre_etape_id] = []
    }

    acc[point.titre_etape_id].push(point)

    return acc
  }, {})

  Object.values(pointsByEtape).forEach(points => {


  const origineGeosystemeId: GeoSystemeId = points[0].geo_systeme_id


    // récupérer les points,
  // les passer dans postgis (ST_MAKEVALID)
  // Créer deux geojson multipolygon et points (écarter les points sans nom ?)
  // Puis
  // les insérer
  const originePoints: FeatureCollectionPoints = {
    type: 'FeatureCollection',
    features: points.map(point => ({type: 'Feature', properties: {nom: point.nom, description: point.description}, geometry: {type: 'Point', coordinates: [point.coordonnees.x, point.coordonnees.y]}}))
    
  } 


  const originePerimetre: FeatureMultiPolygon = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        // TODO
      ]
    }
  }
  })

  

  console.log(points)
}

generate()
  .then(() => {
    console.info('done')
    process.exit(0)
  })
  .catch(e => {
    console.error(e)

    process.exit(1)
  })
