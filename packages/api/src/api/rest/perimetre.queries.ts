/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { z } from 'zod'
import { Pool } from 'pg'
import { TransformableGeoSystemeId } from 'camino-common/src/static/geoSystemes.js'
import { FeatureCollectionPoints, FeatureMultiPolygon, MultiPoint, MultiPolygon, featureMultiPolygonValidator, multiPointsValidator, multiPolygonValidator } from 'camino-common/src/perimetre.js'
import { IConvertMultiPointDbQuery, IGetGeojsonByGeoSystemeIdDbQuery, IGetGeojsonInformationDbQuery, IGetTitresIntersectionWithGeojsonDbQuery } from './perimetre.queries.types.js'
import { TitreStatutId, TitresStatutIds, titreStatutIdValidator } from 'camino-common/src/static/titresStatuts.js'
import { DOMAINES_IDS, DomaineId } from 'camino-common/src/static/domaines.js'
import { TitreSlug, titreSlugValidator } from 'camino-common/src/validators/titres.js'
import { communeIdValidator } from 'camino-common/src/static/communes.js'
import { secteurDbIdValidator } from 'camino-common/src/static/facades.js'
import { foretIdValidator } from 'camino-common/src/static/forets.js'
import { sdomZoneIdValidator } from 'camino-common/src/static/sdom.js'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools.js'
import { KM2, km2Validator, m2Validator } from 'camino-common/src/number.js'

export const convertPoints = async (
  pool: Pool,
  fromGeoSystemeId: TransformableGeoSystemeId,
  toGeoSystemeId: TransformableGeoSystemeId,
  geojsonPoints: FeatureCollectionPoints
): Promise<FeatureCollectionPoints> => {
  if (fromGeoSystemeId === toGeoSystemeId) {
    return geojsonPoints
  }

  const multiPoint: MultiPoint = { type: 'MultiPoint', coordinates: geojsonPoints.features.map(feature => feature.geometry.coordinates) }

  const result = await dbQueryAndValidate(convertMultiPointDb, { fromGeoSystemeId, toGeoSystemeId, geojson: JSON.stringify(multiPoint) }, pool, z.object({ geojson: multiPointsValidator }))

  return {
    type: 'FeatureCollection',
    features: geojsonPoints.features.map((feature, index) => {
      return { ...feature, geometry: { type: 'Point', coordinates: result[0].geojson.coordinates[index] } }
    }),
  }
}

const convertMultiPointDb = sql<
  Redefine<IConvertMultiPointDbQuery, { fromGeoSystemeId: TransformableGeoSystemeId; toGeoSystemeId: TransformableGeoSystemeId; geojson: string }, { geojson: MultiPoint }>
>`
select
    ST_AsGeoJSON (ST_Transform (ST_SetSRID (ST_GeomFromGeoJSON ($ geojson !::text), $ fromGeoSystemeId !::integer), $ toGeoSystemeId !::integer))::json as geojson
LIMIT 1
`

export const getGeojsonByGeoSystemeId = async (
  pool: Pool,
  fromGeoSystemeId: TransformableGeoSystemeId,
  toGeoSystemeId: TransformableGeoSystemeId,
  geojson: FeatureMultiPolygon
): Promise<FeatureMultiPolygon> => {
  if (fromGeoSystemeId === toGeoSystemeId) {
    return geojson
  }
  const result = await dbQueryAndValidate(
    getGeojsonByGeoSystemeIdDb,
    { fromGeoSystemeId, toGeoSystemeId, geojson: JSON.stringify(geojson.geometry) },
    pool,
    z.object({ geojson: multiPolygonValidator })
  )

  if (result.length === 1) {
    const feature: FeatureMultiPolygon = {
      type: 'Feature',
      properties: {},
      geometry: result[0].geojson,
    }

    return featureMultiPolygonValidator.parse(feature)
  }
  throw new Error(`Impossible de convertir le geojson vers le systeme ${toGeoSystemeId}`)
}

const getGeojsonByGeoSystemeIdDb = sql<
  Redefine<IGetGeojsonByGeoSystemeIdDbQuery, { fromGeoSystemeId: TransformableGeoSystemeId; toGeoSystemeId: TransformableGeoSystemeId; geojson: string }, { geojson: MultiPolygon }>
>`
select
    ST_AsGeoJSON (ST_Multi (ST_Transform (ST_SetSRID (ST_GeomFromGeoJSON ($ geojson !::text), $ fromGeoSystemeId !::integer), $ toGeoSystemeId !::integer)))::json as geojson
LIMIT 1
`

const getTitresIntersectionWithGeojsonValidator = z.object({
  nom: z.string(),
  slug: titreSlugValidator,
  titre_statut_id: titreStatutIdValidator,
})

type GetTitresIntersectionWithGeojson = z.infer<typeof getTitresIntersectionWithGeojsonValidator>
export const getTitresIntersectionWithGeojson = async (pool: Pool, geojson4326_perimetre: MultiPolygon, titreSlug: TitreSlug) => {
  return dbQueryAndValidate(
    getTitresIntersectionWithGeojsonDb,
    {
      titre_slug: titreSlug,
      titre_statut_ids: [TitresStatutIds.DemandeInitiale, TitresStatutIds.Valide, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire],
      geojson4326_perimetre,
      domaine_id: DOMAINES_IDS.METAUX,
    },
    pool,
    getTitresIntersectionWithGeojsonValidator
  )
}

const getTitresIntersectionWithGeojsonDb = sql<
  Redefine<
    IGetTitresIntersectionWithGeojsonDbQuery,
    { titre_slug: TitreSlug; titre_statut_ids: TitreStatutId[]; geojson4326_perimetre: MultiPolygon; domaine_id: DomaineId },
    GetTitresIntersectionWithGeojson
  >
>`
select
    t.nom,
    t.slug,
    t.titre_statut_id
from
    titres t
    left join titres_etapes e on t.props_titre_etapes_ids ->> 'points' = e.id
where
    t.archive is false
    and t.titre_statut_id in $$ titre_statut_ids !
    and t.slug != $ titre_slug !
    and ST_INTERSECTS (ST_GeomFromGeoJSON ($ geojson4326_perimetre !), e.geojson4326_perimetre) is true
    and
    right (t.type_id,
        1) = $ domaine_id !
`

const numberTokm2 = (value: number): KM2 => km2Validator.parse(Number.parseFloat((value / 1000000).toFixed(2)))

export const getGeojsonInformation = async (pool: Pool, geojson4326_perimetre: MultiPolygon): Promise<GetGeojsonInformation> => {
  const result = await dbQueryAndValidate(getGeojsonInformationDb, { geojson4326_perimetre }, pool, getGeojsonInformationValidator)
  if (result.length !== 1) {
    throw new Error('On veut un seul résultat')
  }

  return { ...result[0], surface: numberTokm2(result[0].surface), communes: result[0].communes.map(commune => ({ ...commune, surface: m2Validator.parse(commune.surface) })) }
}

const nullToEmptyArray = <Y>(val: null | Y[]): Y[] => {
  if (isNullOrUndefined(val)) {
    return []
  }

  return val
}
const getGeojsonInformationValidator = z.object({
  surface: km2Validator,
  sdom: z.array(sdomZoneIdValidator).nullable().transform(nullToEmptyArray),
  forets: z.array(foretIdValidator).nullable().transform(nullToEmptyArray),
  communes: z
    .array(z.object({ id: communeIdValidator, nom: z.string(), surface: m2Validator }))
    .nullable()
    .transform(nullToEmptyArray),
  secteurs: z.array(secteurDbIdValidator).nullable().transform(nullToEmptyArray),
})
type GetGeojsonInformation = z.infer<typeof getGeojsonInformationValidator>
const getGeojsonInformationDbValidator = z.object({
  surface: z.number(),
  sdom: z.array(sdomZoneIdValidator).nullable().transform(nullToEmptyArray),
  forets: z.array(foretIdValidator).nullable().transform(nullToEmptyArray),
  communes: z
    .array(z.object({ id: communeIdValidator, nom: z.string(), surface: z.number() }))
    .nullable()
    .transform(nullToEmptyArray),
  secteurs: z.array(secteurDbIdValidator).nullable().transform(nullToEmptyArray),
})
type GetGeojsonInformationDbValidator = z.infer<typeof getGeojsonInformationDbValidator>
const getGeojsonInformationDb = sql<Redefine<IGetGeojsonInformationDbQuery, { geojson4326_perimetre: MultiPolygon }, GetGeojsonInformationDbValidator>>`
select
    (
        select
            json_agg(sdom.id) as sdom
        from
            sdom_zones_postgis sdom
        where
            ST_INTERSECTS (ST_GeomFromGeoJSON ($ geojson4326_perimetre !), sdom.geometry) is true) as sdom,
    (
        select
            json_agg(communes_with_surface)
        from (
            select
                c.id,
                c.nom,
                ST_Area (ST_INTERSECTION (ST_MAKEVALID (ST_GeomFromGeoJSON ($ geojson4326_perimetre !)), commune.geometry), true) as surface
            from
                communes_postgis commune
                join communes c on c.id = commune.id
            where
                ST_INTERSECTS (ST_GeomFromGeoJSON ($ geojson4326_perimetre !), commune.geometry) is true) as communes_with_surface) as communes,
    (
        select
            json_agg(foret.id) as forets
        from
            forets_postgis foret
        where
            ST_INTERSECTS (ST_GeomFromGeoJSON ($ geojson4326_perimetre !), foret.geometry) is true) as forets,
    (
        select
            json_agg(secteur.id) as secteurs
        from
            secteurs_maritime_postgis secteur
        where
            ST_INTERSECTS (ST_GeomFromGeoJSON ($ geojson4326_perimetre !), secteur.geometry) is true) as secteurs,
    (
        select
            ST_AREA (ST_GeomFromGeoJSON ($ geojson4326_perimetre !), true)) as surface
`
