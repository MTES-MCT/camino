/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, newDbQueryAndValidate, DbQueryAccessError } from '../../pg-database.js'
import { z } from 'zod'
import TE from 'fp-ts/lib/TaskEither.js'
import E from 'fp-ts/lib/Either.js'
import { Pool } from 'pg'
import { GeoSystemeId } from 'camino-common/src/static/geoSystemes.js'
import { FeatureMultiPolygon, GenericFeatureCollection, MultiPoint, MultiPolygon, featureMultiPolygonValidator, multiPointsValidator, multiPolygonValidator } from 'camino-common/src/perimetre.js'
import { IConvertMultiPointDbQuery, IGetGeojsonByGeoSystemeIdDbQuery, IGetGeojsonInformationDbQuery, IGetTitresIntersectionWithGeojsonDbQuery } from './perimetre.queries.types.js'
import { TitreStatutId, TitresStatutIds, titreStatutIdValidator } from 'camino-common/src/static/titresStatuts.js'
import { DOMAINES_IDS, DomaineId } from 'camino-common/src/static/domaines.js'
import { TitreSlug, titreSlugValidator } from 'camino-common/src/validators/titres.js'
import { communeIdValidator } from 'camino-common/src/static/communes.js'
import { secteurDbIdValidator } from 'camino-common/src/static/facades.js'
import { foretIdValidator } from 'camino-common/src/static/forets.js'
import { sdomZoneIdValidator } from 'camino-common/src/static/sdom.js'
import { KM2, M2, createM2Validator, km2Validator, m2Validator } from 'camino-common/src/number.js'
import { DeepReadonly, isNullOrUndefined } from 'camino-common/src/typescript-tools.js'
import { pipe } from 'fp-ts/lib/function.js'
import { ZodUnparseable, zodParseTaskEither, zodParseTaskEitherCallback } from '../../tools/fp-tools.js'
import { CaminoError } from 'camino-common/src/zod-tools.js'

const convertPointsStringifyError = 'Impossible de transformer la feature collection' as const
const convertPointsConversionError = 'La liste des points est vide' as const
const convertPointsInvalidNumberOfFeaturesError = 'Le nombre de points est invalide' as const
export type ConvertPointsErrors = DbQueryAccessError | ZodUnparseable | typeof convertPointsStringifyError | typeof convertPointsConversionError | typeof convertPointsInvalidNumberOfFeaturesError
export const convertPoints = <T extends z.ZodTypeAny>(
  pool: Pool,
  fromGeoSystemeId: GeoSystemeId,
  toGeoSystemeId: GeoSystemeId,
  geojsonPoints: GenericFeatureCollection<T>
): TE.TaskEither<CaminoError<ConvertPointsErrors>, GenericFeatureCollection<T>> => {
  if (fromGeoSystemeId === toGeoSystemeId) {
    return TE.right(geojsonPoints)
  }

  const multiPoint: MultiPoint = { type: 'MultiPoint', coordinates: geojsonPoints.features.map(feature => feature.geometry.coordinates) }

  return pipe(
    TE.fromEither(
      E.tryCatch(
        () => JSON.stringify(multiPoint),
        e => ({ message: convertPointsStringifyError, extra: e })
      )
    ),
    TE.flatMap(geojson => newDbQueryAndValidate(convertMultiPointDb, { fromGeoSystemeId, toGeoSystemeId, geojson }, pool, z.object({ geojson: multiPointsValidator }))),
    TE.flatMap(result => {
      if (result.length === 0) {
        return TE.left({ message: convertPointsConversionError })
      }

      return TE.right(result[0].geojson.coordinates)
    }),
    TE.filterOrElseW(
      coordinates => coordinates.length === geojsonPoints.features.length,
      () => ({ message: convertPointsInvalidNumberOfFeaturesError })
    ),
    TE.map(coordinates => {
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
export type GetGeojsonByGeoSystemeIdErrorMessages = ZodUnparseable | DbQueryAccessError | typeof conversionSystemeError | typeof perimetreInvalideError | typeof conversionGeometrieError
export const getGeojsonByGeoSystemeId = (
  pool: Pool,
  fromGeoSystemeId: GeoSystemeId,
  toGeoSystemeId: GeoSystemeId,
  geojson: FeatureMultiPolygon
): TE.TaskEither<CaminoError<GetGeojsonByGeoSystemeIdErrorMessages>, FeatureMultiPolygon> => {
  return pipe(
    TE.fromEither(
      E.tryCatch(
        () => JSON.stringify(geojson.geometry),
        () => ({ message: conversionGeometrieError })
      )
    ),
    TE.flatMap(geojson => newDbQueryAndValidate(getGeojsonByGeoSystemeIdDb, { fromGeoSystemeId, toGeoSystemeId, geojson }, pool, getGeojsonByGeoSystemeIdValidator)),
    TE.filterOrElseW(
      result => result.length === 1,
      () => ({ message: conversionSystemeError, extra: toGeoSystemeId })
    ),
    TE.filterOrElseW(
      result => result[0].is_valid === true,
      () => ({ message: perimetreInvalideError, extra: { fromGeoSystemeId, geojson } })
    ),
    TE.map(result => {
      if (fromGeoSystemeId === toGeoSystemeId) {
        return geojson
      }
      const feature: FeatureMultiPolygon = {
        type: 'Feature',
        properties: {},
        geometry: result[0].geojson,
      }

      return feature
    }),
    TE.flatMap(zodParseTaskEitherCallback(featureMultiPolygonValidator))
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
): TE.TaskEither<CaminoError<ZodUnparseable | DbQueryAccessError>, GetTitresIntersectionWithGeojson[]> => {
  return newDbQueryAndValidate(
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
    and ST_INTERSECTS (ST_MAKEVALID (ST_GeomFromGeoJSON ($ geojson4326_perimetre !)), ST_MAKEVALID (e.geojson4326_perimetre)) is true
    and
    right (t.type_id,
        1) = $ domaine_id !
`

const m2ToKm2 = (value: M2): TE.TaskEither<CaminoError<ZodUnparseable>, KM2> => zodParseTaskEither(km2Validator, Number.parseFloat((value / 1_000_000).toFixed(2)))

const requestError = 'Une erreur inattendue est survenue lors de la récupération des informations geojson en base' as const
export type GetGeojsonInformationErrorMessages = ZodUnparseable | DbQueryAccessError | typeof requestError
export const getGeojsonInformation = (pool: Pool, geojson4326_perimetre: MultiPolygon): TE.TaskEither<CaminoError<GetGeojsonInformationErrorMessages>, GetGeojsonInformation> => {
  return pipe(
    newDbQueryAndValidate(getGeojsonInformationDb, { geojson4326_perimetre }, pool, getGeojsonInformationDbValidator),
    TE.bindW('response', result => (result.length === 1 ? TE.right(result[0]) : TE.left({ message: requestError }))),
    TE.bindW('surface', result => m2ToKm2(result.response.surface)),
    TE.map(({ response, surface }) => {
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
const getGeojsonInformationDb = sql<Redefine<IGetGeojsonInformationDbQuery, { geojson4326_perimetre: MultiPolygon }, GetGeojsonInformationDbValidator>>`
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
                c.id,
                c.nom,
                ST_Area (ST_INTERSECTION (ST_MAKEVALID (ST_GeomFromGeoJSON ($ geojson4326_perimetre !)), commune.geometry), true) as surface
            from
                communes_postgis commune
                join communes c on c.id = commune.id
            where
                ST_INTERSECTS (ST_MAKEVALID (ST_GeomFromGeoJSON ($ geojson4326_perimetre !)), commune.geometry) is true) as communes_with_surface) as communes,
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
