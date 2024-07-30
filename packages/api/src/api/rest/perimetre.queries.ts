/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, DbQueryAccessError, effectDbQueryAndValidate } from '../../pg-database'
import { z } from 'zod'
import { Pool } from 'pg'
import { GEO_SYSTEME_IDS, GeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { FeatureMultiPolygon, GenericFeatureCollection, MultiPoint, MultiPolygon, featureMultiPolygonValidator, multiPointsValidator, multiPolygonValidator } from 'camino-common/src/perimetre'
import { IConvertMultiPointDbQuery, IGetGeojsonByGeoSystemeIdDbQuery, IGetGeojsonInformationDbQuery, IGetTitresIntersectionWithGeojsonDbQuery } from './perimetre.queries.types'
import { TitreStatutId, TitresStatutIds, titreStatutIdValidator } from 'camino-common/src/static/titresStatuts'
import { DOMAINES_IDS, DomaineId } from 'camino-common/src/static/domaines'
import { TitreSlug, titreSlugValidator } from 'camino-common/src/validators/titres'
import { communeIdValidator } from 'camino-common/src/static/communes'
import { secteurDbIdValidator } from 'camino-common/src/static/facades'
import { foretIdValidator } from 'camino-common/src/static/forets'
import { sdomZoneIdValidator } from 'camino-common/src/static/sdom'
import { KM2, M2, createM2Validator, km2Validator, m2Validator } from 'camino-common/src/number'
import { DeepReadonly, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { ZodUnparseable, zodParseEffect, zodParseEffectCallback } from '../../tools/fp-tools'
import { CaminoError } from 'camino-common/src/zod-tools'
import { Effect, pipe } from 'effect'

const arrayTuple4326CoordinateValidator = z.array(z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]))
const convertPointsStringifyError = 'Impossible de transformer la feature collection' as const
const convertPointsConversionError = 'La liste des points est vide' as const
const convertPointsInvalidNumberOfFeaturesError = 'Le nombre de points est invalide' as const
const invalidSridError = 'Problème de Système géographique (SRID)' as const
export type ConvertPointsErrors =
  | DbQueryAccessError
  | ZodUnparseable
  | typeof convertPointsStringifyError
  | typeof convertPointsConversionError
  | typeof convertPointsInvalidNumberOfFeaturesError
  | typeof invalidSridError
const to4326GeoSystemeId: GeoSystemeId = GEO_SYSTEME_IDS.WGS84

export const convertPoints = <T extends z.ZodTypeAny>(
  pool: Pool,
  fromGeoSystemeId: GeoSystemeId,
  geojsonPoints: GenericFeatureCollection<T>
): Effect.Effect<GenericFeatureCollection<T>, CaminoError<ConvertPointsErrors>> => {
  return pipe(
    Effect.try({
      try: () => {
        const multiPoint: MultiPoint = { type: 'MultiPoint', coordinates: geojsonPoints.features.map(feature => feature.geometry.coordinates) }

        return JSON.stringify(multiPoint)
      },
      catch: e => ({ message: convertPointsStringifyError, extra: e }),
    }),
    Effect.flatMap(geojson => effectDbQueryAndValidate(convertMultiPointDb, { fromGeoSystemeId, toGeoSystemeId: to4326GeoSystemeId, geojson }, pool, z.object({ geojson: multiPointsValidator }))),
    Effect.flatMap(result => {
      if (result.length === 0) {
        return Effect.fail({ message: convertPointsConversionError })
      }

      return Effect.succeed(result[0].geojson.coordinates)
    }),
    Effect.filterOrFail(
      coordinates => coordinates.length === geojsonPoints.features.length,
      () => ({ message: convertPointsInvalidNumberOfFeaturesError })
    ),
    Effect.flatMap((result: [number, number][]) => {
      const check = zodParseEffect(arrayTuple4326CoordinateValidator, result)

      return Effect.matchEffect(check, {
        onSuccess: () => Effect.succeed(result),
        onFailure: error => Effect.fail({ ...error, message: invalidSridError, detail: 'Vérifiez que le géosystème correspond bien à celui du fichier' }),
      })
    }),
    Effect.map(coordinates => {
      return {
        type: 'FeatureCollection',
        features: geojsonPoints.features.map((feature, index) => {
          return { ...feature, geometry: { type: 'Point', coordinates: coordinates[index] } }
        }),
      }
    })
  )
}

const convertMultiPointDb = sql<Redefine<IConvertMultiPointDbQuery, { fromGeoSystemeId: GeoSystemeId; toGeoSystemeId: GeoSystemeId; geojson: string }, { geojson: MultiPoint }>>`
select
    ST_AsGeoJSON (ST_Transform (ST_MAKEVALID (ST_SetSRID (ST_GeomFromGeoJSON ($ geojson !::text), $ fromGeoSystemeId !::integer)), $ toGeoSystemeId !::integer), 40)::json as geojson
LIMIT 1
`
const conversionSystemeError = 'Impossible de convertir le geojson vers le système' as const
const perimetreInvalideError = "Le périmètre n'est pas valide dans le référentiel donné" as const
const conversionGeometrieError = 'Impossible de convertir la géométrie en JSON' as const
const getGeojsonByGeoSystemeIdValidator = z.object({ geojson: multiPolygonValidator, is_valid: z.boolean().nullable() })
const polygon4326CoordinatesValidator = z.array(z.array(arrayTuple4326CoordinateValidator.min(3)).min(1)).min(1)

export type GetGeojsonByGeoSystemeIdErrorMessages =
  | ZodUnparseable
  | DbQueryAccessError
  | typeof conversionSystemeError
  | typeof perimetreInvalideError
  | typeof conversionGeometrieError
  | typeof invalidSridError
export const getGeojsonByGeoSystemeId = (
  pool: Pool,
  fromGeoSystemeId: GeoSystemeId,
  geojson: FeatureMultiPolygon
): Effect.Effect<FeatureMultiPolygon, CaminoError<GetGeojsonByGeoSystemeIdErrorMessages>> => {
  return pipe(
    Effect.try({
      try: () => JSON.stringify(geojson.geometry),
      catch: () => ({ message: conversionGeometrieError }),
    }),
    Effect.flatMap(geojson => effectDbQueryAndValidate(getGeojsonByGeoSystemeIdDb, { fromGeoSystemeId, toGeoSystemeId: to4326GeoSystemeId, geojson }, pool, getGeojsonByGeoSystemeIdValidator)),
    Effect.filterOrFail(
      result => result.length === 1,
      () => ({ message: conversionSystemeError, extra: to4326GeoSystemeId })
    ),
    Effect.filterOrFail(
      result => result[0].is_valid === true,
      () => ({ message: perimetreInvalideError, extra: { fromGeoSystemeId, geojson } })
    ),
    Effect.flatMap(result => {
      const coordinates: [number, number][][][] = result[0].geojson.coordinates

      const check = zodParseEffect(polygon4326CoordinatesValidator, coordinates)

      return Effect.matchEffect(check, {
        onSuccess: () => Effect.succeed(result),
        onFailure: error => Effect.fail({ ...error, message: invalidSridError, detail: 'Vérifiez que le géosystème correspond bien à celui du fichier' }),
      })
    }),
    Effect.map(result => {
      if (fromGeoSystemeId === to4326GeoSystemeId) {
        return geojson
      }
      const feature: FeatureMultiPolygon = {
        type: 'Feature',
        properties: {},
        geometry: result[0].geojson,
      }

      return feature
    }),
    Effect.flatMap(zodParseEffectCallback(featureMultiPolygonValidator))
  )
}

const getGeojsonByGeoSystemeIdDb = sql<
  Redefine<IGetGeojsonByGeoSystemeIdDbQuery, { fromGeoSystemeId: GeoSystemeId; toGeoSystemeId: GeoSystemeId; geojson: string }, z.infer<typeof getGeojsonByGeoSystemeIdValidator>>
>`
select
    ST_ISValid (ST_GeomFromGeoJSON ($ geojson !::text)) as is_valid,
    ST_AsGeoJSON (ST_Multi (ST_Transform (ST_MAKEVALID (ST_SetSRID (ST_GeomFromGeoJSON ($ geojson !::text), $ fromGeoSystemeId !::integer)), $ toGeoSystemeId !::integer)), 40)::json as geojson
LIMIT 1
`

const getTitresIntersectionWithGeojsonValidator = z.object({
  nom: z.string(),
  slug: titreSlugValidator,
  titre_statut_id: titreStatutIdValidator,
})

export type GetTitresIntersectionWithGeojson = z.infer<typeof getTitresIntersectionWithGeojsonValidator>
export const getTitresIntersectionWithGeojson = (
  pool: Pool,
  geojson4326_perimetre: MultiPolygon,
  titreSlug: TitreSlug
): Effect.Effect<GetTitresIntersectionWithGeojson[], CaminoError<ZodUnparseable | DbQueryAccessError>> => {
  return effectDbQueryAndValidate(
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
type GetTitresIntersectionWithGeojsonDb = DeepReadonly<{ titre_slug: TitreSlug; titre_statut_ids: TitreStatutId[]; geojson4326_perimetre: MultiPolygon; domaine_id: DomaineId }>
const getTitresIntersectionWithGeojsonDb = sql<Redefine<IGetTitresIntersectionWithGeojsonDbQuery, GetTitresIntersectionWithGeojsonDb, GetTitresIntersectionWithGeojson>>`
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
    and ST_INTERSECTS (ST_MAKEVALID (ST_GeomFromGeoJSON ($ geojson4326_perimetre !)), ST_MAKEVALID (e.geojson4326_perimetre)) is true
    and
    right (t.type_id,
        1) = $ domaine_id !
`

const m2ToKm2 = (value: M2): Effect.Effect<KM2, CaminoError<ZodUnparseable>> => zodParseEffect(km2Validator, Number.parseFloat((value / 1_000_000).toFixed(2)))

const requestError = 'Une erreur inattendue est survenue lors de la récupération des informations geojson en base' as const
export type GetGeojsonInformationErrorMessages = ZodUnparseable | DbQueryAccessError | typeof requestError
export const getGeojsonInformation = (pool: Pool, geojson4326_perimetre: MultiPolygon): Effect.Effect<GetGeojsonInformation, CaminoError<GetGeojsonInformationErrorMessages>> => {
  return pipe(
    effectDbQueryAndValidate(getGeojsonInformationDb, { geojson4326_perimetre }, pool, getGeojsonInformationDbValidator),
    Effect.bind('response', result => (result.length === 1 ? Effect.succeed(result[0]) : Effect.fail({ message: requestError }))),
    Effect.bind('surface', result => m2ToKm2(result.response.surface)),
    Effect.map(({ response, surface }) => {
      return { ...response, surface }
    })
  )
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

// Surface maximale acceptée pour un titre
const SURFACE_M2_MAX = 100_000 * 1_000_000
export type GetGeojsonInformation = DeepReadonly<z.infer<typeof getGeojsonInformationValidator>>
const getGeojsonInformationCommuneDbValidator = z.object({ id: communeIdValidator, nom: z.string(), surface: m2Validator })

const getGeojsonInformationDbValidator = z.object({
  surface: createM2Validator(z.number().max(SURFACE_M2_MAX, `Le périmètre ne doit pas excéder ${SURFACE_M2_MAX}M²`)),
  sdom: z.array(sdomZoneIdValidator).nullable().transform(nullToEmptyArray),
  forets: z.array(foretIdValidator).nullable().transform(nullToEmptyArray),
  communes: z.array(getGeojsonInformationCommuneDbValidator).nullable().transform(nullToEmptyArray),
  secteurs: z.array(secteurDbIdValidator).nullable().transform(nullToEmptyArray),
})
type GetGeojsonInformationDbValidator = z.infer<typeof getGeojsonInformationDbValidator>
const getGeojsonInformationDb = sql<Redefine<IGetGeojsonInformationDbQuery, DeepReadonly<{ geojson4326_perimetre: MultiPolygon }>, GetGeojsonInformationDbValidator>>`
select
    (
        select
            json_agg(sdom.id) as sdom
        from
            sdom_zones_postgis sdom
        where
            ST_INTERSECTS (ST_MAKEVALID (ST_GeomFromGeoJSON ($ geojson4326_perimetre !)), sdom.geometry) is true) as sdom,
    (
        select
            json_agg(communes_with_surface)
        from (
            select
                communes.id,
                communes.nom,
                ST_Area (ST_INTERSECTION (ST_MAKEVALID (ST_GeomFromGeoJSON ($ geojson4326_perimetre !)), communes.geometry), true) as surface
            from communes
            where
                ST_INTERSECTS (ST_MAKEVALID (ST_GeomFromGeoJSON ($ geojson4326_perimetre !)), communes.geometry) is true) as communes_with_surface) as communes,
    (
        select
            json_agg(foret.id) as forets
        from
            forets_postgis foret
        where
            ST_INTERSECTS (ST_MAKEVALID (ST_GeomFromGeoJSON ($ geojson4326_perimetre !)), foret.geometry) is true) as forets,
    (
        select
            json_agg(secteur.id) as secteurs
        from
            secteurs_maritime_postgis secteur
        where
            ST_INTERSECTS (ST_MAKEVALID (ST_GeomFromGeoJSON ($ geojson4326_perimetre !)), secteur.geometry) is true) as secteurs,
    (
        select
            ST_AREA (ST_MAKEVALID (ST_GeomFromGeoJSON ($ geojson4326_perimetre !)), true)) as surface
`
