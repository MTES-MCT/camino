import { Knex } from 'knex'
import { geojsonFeatureCollectionPoints, geojsonFeatureMultiPolygon } from '../../tools/geojson.js'
import { EtapeId } from 'camino-common/src/etape.js'
import { ITitrePoint } from '../../types.js'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools.js'

const etapesToNotMigrate = ["0NmsqYGVQJYKhFY22Ltt4NBV"]
export const up = async (knex: Knex) => {
  // await knex.raw('alter table titres_etapes add column geojson4326_perimetre public.geometry(MultiPolygon,4326)')
  // await knex.raw('alter table titres_etapes add column geojson4326_points JSONB')
  // await knex.raw('alter table titres_etapes add column geojson4326 public.geometry(GeometryCollection,4326)')

  const etapes: { rows: { id: EtapeId }[] } = await knex.raw('select * from titres_etapes')


  for (const etape of etapes.rows) {
    if (!etapesToNotMigrate.includes(etape.id)) {
      const points: { rows: Pick<ITitrePoint, 'groupe' | 'contour' | 'coordonnees' | 'point'>[] } = await knex.raw('select * from titres_points where titre_etape_id = ?', [etape.id])

      if (isNotNullNorUndefinedNorEmpty(points.rows)) {
        const geojsonPoints = geojsonFeatureCollectionPoints(points.rows)

        await knex.raw(`update titres_etapes set geojson4326_perimetre = ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(geojsonFeatureMultiPolygon(points.rows).geometry)}'), 4326), geojson4326_points = ?::jsonb where id = ?`, [JSON.stringify(geojsonPoints.features), etape.id])

        await knex.raw('select ST_Centroid(te.geojson4326_perimetre) from titres_etapes te  where te.id = ?', [etape.id])
      }
    }

  }



  // FIXME migrer les titres_points_references
  // await knex.raw('alter table titres drop column coordonnees')
  // await knex.raw('drop table titres_points_references')
  // await knex.raw('drop table titres_points')

}

export const down = () => ({})
