/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { z } from 'zod'
import { Pool } from 'pg'
import { GeoSysteme, GeoSystemes, TransformableGeoSystemeId } from 'camino-common/src/static/geoSystemes.js'
import { FeatureMultiPolygon, MultiPolygon, featureMultiPolygonValidator, multiPolygonValidator } from 'camino-common/src/demarche.js'
import { IGetGeojsonByGeoSystemeIdDbQuery, IGetTitresIntersectionWithGeojsonDbQuery } from './perimetre.queries.types.js'
import { TitreStatutId, TitresStatutIds, titreStatutIdValidator } from 'camino-common/src/static/titresStatuts.js'
import { DOMAINES_IDS, DomaineId } from 'camino-common/src/static/domaines.js'
import { titreSlugValidator } from 'camino-common/src/titres.js'

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

const getTitresIntersectionWithGeojsonValidator = z.object({
  nom: z.string(),
  slug: titreSlugValidator,
  titre_statut_id: titreStatutIdValidator
})

type GetTitresIntersectionWithGeojson = z.infer<typeof getTitresIntersectionWithGeojsonValidator>
export const getTitresIntersectionWithGeojson = async (pool: Pool, geojson4326_perimetre: MultiPolygon) => {

  return dbQueryAndValidate(
    getTitresIntersectionWithGeojsonDb,
    { titre_statut_ids: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Valide, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire], geojson4326_perimetre, domaine_id: DOMAINES_IDS.METAUX },
    pool,
    getTitresIntersectionWithGeojsonValidator
  )
}

const getTitresIntersectionWithGeojsonDb = sql<Redefine<IGetTitresIntersectionWithGeojsonDbQuery, { titre_statut_ids: TitreStatutId[], geojson4326_perimetre: MultiPolygon, domaine_id: DomaineId }, GetTitresIntersectionWithGeojson>>`
select
 t.nom,
 t.slug,
 t.titre_statut_id
from titres t
left join titres_etapes e on t.props_titre_etapes_ids ->> 'points' = e.id
where t.archive is false
and t.titre_statut_id in $$titre_statut_ids!
and ST_INTERSECTS(ST_GeomFromGeoJSON($geojson4326_perimetre!), e.geojson4326_perimetre) is true
and right(t.type_id, 1) =  $domaine_id!
`