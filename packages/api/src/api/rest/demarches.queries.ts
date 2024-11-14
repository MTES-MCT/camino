import { sql } from '@pgtyped/runtime'
import { commonTitreEnConcurrenceValidator, DemarcheId, DemarcheIdOrSlug, demarcheIdValidator, GetDemarcheMiseEnConcurrence, GetResultatMiseEnConcurrence } from 'camino-common/src/demarche'
import { EffectDbQueryAndValidateErrors, Redefine, effectDbQueryAndValidate } from '../../pg-database'
import {
  IGetDemarcheByIdOrSlugDbQuery,
  IGetDemarchePivotEnConcurrenceDbQuery,
  IGetDemarchesEnConcurrenceDbQuery,
  IGetDemarchesSatellitesEnConcurrenceDbQuery,
  IGetEtapesByDemarcheIdDbQuery,
  IGetPerimetreSansSatelliteDbQuery,
} from './demarches.queries.types'
import { IGetDemarchesDbQuery } from './demarches.queries.types'
import { z } from 'zod'
import { caminoDateValidator } from 'camino-common/src/date'
import { communeValidator } from 'camino-common/src/static/communes'
import { secteurMaritimeValidator } from 'camino-common/src/static/facades'
import { substanceLegaleIdValidator } from 'camino-common/src/static/substancesLegales'
import { ETAPES_TYPES, etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes'
import { etapeBrouillonValidator, etapeIdValidator, etapeNoteValidator, etapeSlugValidator } from 'camino-common/src/etape'
import { etapeStatutIdValidator } from 'camino-common/src/static/etapesStatuts'
import { contenuValidator } from './activites.queries'
import { sdomZoneIdValidator } from 'camino-common/src/static/sdom'
import { foretIdValidator } from 'camino-common/src/static/forets'
import { Pool } from 'pg'
import {
  featureCollectionForagesValidator,
  featureCollectionPointsValidator,
  FeatureMultiPolygon,
  featureMultiPolygonValidator,
  MultiPolygon,
  multiPolygonValidator,
} from 'camino-common/src/perimetre'
import { etapeHeritagePropsValidator } from 'camino-common/src/heritage'
import { getDemarcheByIdOrSlugValidator as commonGetDemarcheByIdOrSlugValidator } from 'camino-common/src/titres'
import { geoSystemeIdValidator } from 'camino-common/src/static/geoSystemes'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { KM2, km2Validator, m2toKm2, m2Validator } from 'camino-common/src/number'
import { Effect, pipe } from 'effect'
import { CaminoError } from 'camino-common/src/zod-tools'
import { isAdministration, isSuper, User } from 'camino-common/src/roles'
import { DeepReadonly, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools'

const getEtapesByDemarcheIdDbValidator = z.object({
  id: etapeIdValidator,
  slug: etapeSlugValidator,
  date: caminoDateValidator,
  ordre: z.number(),
  note: etapeNoteValidator,
  communes: z.array(communeValidator.pick({ id: true })),
  secteurs_maritime: z.array(secteurMaritimeValidator).nullable(),
  substances: z.array(substanceLegaleIdValidator).nullable(),
  etape_type_id: etapeTypeIdValidator,
  etape_statut_id: etapeStatutIdValidator,
  heritage_props: z.record(etapeHeritagePropsValidator, z.object({ actif: z.boolean() })).nullable(),
  heritage_contenu: z.record(z.string(), z.record(z.string(), z.object({ actif: z.boolean() }).optional()).optional()).nullable(),
  date_debut: caminoDateValidator.nullable(),
  date_fin: caminoDateValidator.nullable(),
  duree: z.number().nullable(),
  surface: km2Validator.nullable(),
  contenu: contenuValidator.nullable(),
  sdom_zones: z.array(sdomZoneIdValidator).nullable(),
  forets: z.array(foretIdValidator).nullable(),
  geojson4326_perimetre: multiPolygonValidator.nullable(),
  geojson4326_points: featureCollectionPointsValidator.nullable(),
  geojson_origine_points: featureCollectionPointsValidator.nullable(),
  geojson_origine_perimetre: featureMultiPolygonValidator.nullable(),
  geojson_origine_geo_systeme_id: geoSystemeIdValidator.nullable(),
  geojson4326_forages: featureCollectionForagesValidator.nullable(),
  geojson_origine_forages: featureCollectionForagesValidator.nullable(),
  titulaire_ids: z.array(entrepriseIdValidator),
  amodiataire_ids: z.array(entrepriseIdValidator),
  is_brouillon: etapeBrouillonValidator,
  demarche_id_en_concurrence: demarcheIdValidator.nullable(),
  demarche_ids_consentement: z.array(demarcheIdValidator),
  etape_fondamentale_id: etapeIdValidator,
})

export const getEtapesByDemarcheId = (pool: Pool, demarcheId: DemarcheId): Effect.Effect<GetEtapesByDemarcheIdDb[], CaminoError<EffectDbQueryAndValidateErrors>> =>
  effectDbQueryAndValidate(getEtapesByDemarcheIdDb, { demarcheId }, pool, getEtapesByDemarcheIdDbValidator)

type GetEtapesByDemarcheIdDb = z.infer<typeof getEtapesByDemarcheIdDbValidator>
const getEtapesByDemarcheIdDb = sql<Redefine<IGetEtapesByDemarcheIdDbQuery, { demarcheId: DemarcheId }, GetEtapesByDemarcheIdDb>>`
select
    e.id,
    e.date,
    e.ordre,
    e.note,
    e.communes,
    e.secteurs_maritime,
    e.substances,
    e.type_id as etape_type_id,
    e.statut_id as etape_statut_id,
    e.heritage_props,
    e.heritage_contenu,
    e.date_debut,
    e.date_fin,
    e.duree,
    e.surface,
    e.contenu,
    e.slug,
    e.sdom_zones,
    e.forets,
    ST_AsGeoJSON (e.geojson4326_perimetre, 40)::json as geojson4326_perimetre,
    e.geojson4326_points as geojson4326_points,
    e.geojson_origine_points,
    e.geojson_origine_perimetre,
    e.geojson_origine_geo_systeme_id,
    e.geojson4326_forages,
    e.geojson_origine_forages,
    e.titulaire_ids,
    e.amodiataire_ids,
    e.is_brouillon,
    e.demarche_id_en_concurrence,
    e.demarche_ids_consentement,
    e.etape_fondamentale_id
from
    titres_etapes e
where
    e.titre_demarche_id = $ demarcheId !
    and e.archive is false
order by
    date desc
`

const getDemarcheByIdOrSlugValidator = commonGetDemarcheByIdOrSlugValidator.extend({
  entreprises_lecture: z.boolean(),
  public_lecture: z.boolean(),
})

type GetDemarcheByIdOrSlugValidator = z.infer<typeof getDemarcheByIdOrSlugValidator>

export type GetDemarcheByIdOrSlugErrors = EffectDbQueryAndValidateErrors | "La démarche n'existe pas"
export const getDemarcheByIdOrSlug = (pool: Pool, idOrSlug: DemarcheIdOrSlug): Effect.Effect<GetDemarcheByIdOrSlugValidator, CaminoError<GetDemarcheByIdOrSlugErrors>> =>
  pipe(
    effectDbQueryAndValidate(getDemarcheByIdOrSlugDb, { idOrSlug }, pool, getDemarcheByIdOrSlugValidator),
    Effect.filterOrFail(
      demarches => isNotNullNorUndefinedNorEmpty(demarches),
      () => ({ message: "La démarche n'existe pas" as const })
    ),
    Effect.map(demarches => demarches[0])
  )

const getDemarcheByIdOrSlugDb = sql<Redefine<IGetDemarcheByIdOrSlugDbQuery, { idOrSlug: DemarcheIdOrSlug }, GetDemarcheByIdOrSlugValidator>>`
select
    td.id as demarche_id,
    td.slug as demarche_slug,
    td.type_id as demarche_type_id,
    td.description as demarche_description,
    td.entreprises_lecture,
    td.public_lecture,
    t.id as titre_id,
    t.slug as titre_slug,
    t.type_id as titre_type_id,
    t.nom as titre_nom
from
    titres_demarches td
    join titres t on t.id = td.titre_id
where (td.id = $ idOrSlug !
    or td.slug = $ idOrSlug !)
and td.archive is false
`

const getDemarchesEnConcurrenceDbValidator = z.object({
  titre_nom: z.string(),
  demarche_id: demarcheIdValidator,
  demarche_public_lecture: z.boolean(),
})
export const getDemarchesEnConcurrenceQuery = (
  pool: Pool,
  demarcheIdPivot: DemarcheId,
  user: DeepReadonly<User>
): Effect.Effect<GetDemarcheMiseEnConcurrence[], CaminoError<EffectDbQueryAndValidateErrors>> => {
  return pipe(
    effectDbQueryAndValidate(getDemarchesEnConcurrenceDb, { demarcheIdPivot }, pool, getDemarchesEnConcurrenceDbValidator),
    Effect.map(demarches =>
      demarches
        .filter(({ demarche_public_lecture }) => demarche_public_lecture === true || isAdministration(user) || isSuper(user))
        .map(demarche => ({
          demarcheId: demarche.demarche_id,
          titreNom: demarche.titre_nom,
        }))
    )
  )
}

type GetDemarchesEnConcurrenceDb = z.infer<typeof getDemarchesEnConcurrenceDbValidator>
const getDemarchesEnConcurrenceDb = sql<Redefine<IGetDemarchesEnConcurrenceDbQuery, { demarcheIdPivot: DemarcheId }, GetDemarchesEnConcurrenceDb>>`
select
    t.nom as titre_nom,
    td.id as demarche_id,
    td.public_lecture as demarche_public_lecture
from
    titres_etapes e
    join titres_demarches td on e.titre_demarche_id = td.id
    join titres t on td.titre_id = t.id
where
    (e.demarche_id_en_concurrence = $ demarcheIdPivot !
    or (e.titre_demarche_id = $ demarcheIdPivot! and e.type_id = 'mfr')
    )
    and e.archive is false
`

const multipolygontoFeatureMultipolygon = (multipolygon: MultiPolygon): FeatureMultiPolygon => {
  return {
    type: 'Feature',
    geometry: multipolygon,
    properties: {},
  }
}

const getDemarchePivotEnConcurrenceDbValidator = commonTitreEnConcurrenceValidator
  .pick({
    demarcheId: true,
    demarcheTypeId: true,
    titreNom: true,
    titreSlug: true,
    titreTypeId: true,
  })
  .extend({
    perimetreTotalGeojson4326: multiPolygonValidator,
    perimetreTotalSurface: km2Validator,
    titulaireIds: z.array(entrepriseIdValidator),
  })
export const getDemarchePivotEnConcurrence = (
  pool: Pool,
  demarcheIdPivot: DemarcheId,
  _user: DeepReadonly<User>
): Effect.Effect<GetResultatMiseEnConcurrence, CaminoError<EffectDbQueryAndValidateErrors | "La démarche n'existe pas">> => {
  return Effect.Do.pipe(
    Effect.bind('pivots', () =>
      effectDbQueryAndValidate(
        getDemarchePivotEnConcurrenceDb,
        { demarcheIdPivot, miseEnConcurrenceTypeId: ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF },
        pool,
        getDemarchePivotEnConcurrenceDbValidator
      )
    ),
    Effect.filterOrFail(
      ({ pivots }) => isNotNullNorUndefinedNorEmpty(pivots),
      () => ({ message: "La démarche n'existe pas" as const })
    ),
    Effect.bind('pivot', ({ pivots }) => Effect.succeed(pivots[0])),
    Effect.bind('satellites', ({ pivot }) =>
      effectDbQueryAndValidate(getDemarchesSatellitesEnConcurrenceDb, { demarcheIdPivot, perimetrePivot: pivot.perimetreTotalGeojson4326 }, pool, getDemarchesSatellitesEnConcurrenceDbValidator)
    ),
    Effect.flatMap(({ pivot, satellites }) => {
      const initialAcc: {
        geojson_4326: MultiPolygon | null
        surface: KM2
      } = {
        geojson_4326: pivot.perimetreTotalGeojson4326,
        surface: pivot.perimetreTotalSurface,
      }

      return pipe(
        Effect.reduce(satellites, initialAcc, (acc, satellite) => {
          if (isNullOrUndefined(acc.geojson_4326)) {
            return Effect.succeed(acc)
          }

          return pipe(
            effectDbQueryAndValidate(getPerimetreSansSatelliteDb, { perimetrePivot: acc.geojson_4326, perimetreSatellite: satellite.perimetre }, pool, getPerimetreSansSatelliteValidator),
            Effect.map(result => ({
              geojson_4326: result[0].perimetre_sans_satellite,
              surface: m2toKm2(result[0].surface_sans_satellite),
            }))
          )
        }),
        Effect.map(perimetreSansSatellite => {
          return {
            ...pivot,

            titulaireId: pivot.titulaireIds[0],
            perimetreTotal: {
              geojson4326_perimetre: multipolygontoFeatureMultipolygon(pivot.perimetreTotalGeojson4326),
              surface: pivot.perimetreTotalSurface,
            },
            perimetreSansSatellite: {
              geojson4326_perimetre: isNotNullNorUndefined(perimetreSansSatellite.geojson_4326) ? multipolygontoFeatureMultipolygon(perimetreSansSatellite.geojson_4326) : null,
              surface: perimetreSansSatellite.surface,
            },
          }
        })
      )
    })
  )
}

type GetDemarchePivotEnConcurrenceDb = z.infer<typeof getDemarchePivotEnConcurrenceDbValidator>
const getDemarchePivotEnConcurrenceDb = sql<
  Redefine<IGetDemarchePivotEnConcurrenceDbQuery, { demarcheIdPivot: DemarcheId; miseEnConcurrenceTypeId: typeof ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF }, GetDemarchePivotEnConcurrenceDb>
>`
select
    t.nom as "titreNom",
    t.slug AS "titreSlug",
    td.type_id AS "demarcheTypeId",
    td.id as "demarcheId",
    t.type_id AS "titreTypeId",
    ST_AsGeoJSON(ST_Multi(te.geojson4326_perimetre))::json as "perimetreTotalGeojson4326",
    te.surface as "perimetreTotalSurface",
    te.titulaire_ids as "titulaireIds"

from
    titres_demarches td
    join titres_etapes te on te.titre_demarche_id = td.id and te.type_id = $miseEnConcurrenceTypeId! and te.archive is false
    join titres t on td.titre_id = t.id
where
    td.id = $ demarcheIdPivot !
    and td.archive is false
`
const getDemarchesSatellitesEnConcurrenceDbValidator = commonTitreEnConcurrenceValidator
  .pick({
    demarcheId: true,
    demarcheTypeId: true,
    titreNom: true,
    titreSlug: true,
    titreTypeId: true,
  })
  .extend({
    titulaireIds: z.array(entrepriseIdValidator),
    perimetre: multiPolygonValidator,
    perimetreEnCommun: multiPolygonValidator,
    surfaceEnCommun: m2Validator,
  })
const getDemarchesSatellitesEnConcurrenceDb = sql<
  Redefine<IGetDemarchesSatellitesEnConcurrenceDbQuery, { demarcheIdPivot: DemarcheId; perimetrePivot: DeepReadonly<MultiPolygon> }, z.infer<typeof getDemarchesSatellitesEnConcurrenceDbValidator>>
>`
  select
    tmp."titreNom",
    tmp."titreSlug",
    tmp."demarcheId",
    tmp."demarcheTypeId",
    tmp."titreTypeId",
    tmp."titulaireIds",
    ST_AsGeoJSON(ST_Multi(tmp.geojson4326_perimetre))::json AS perimetre,
    ST_AREA(tmp."perimetreGeomEnCommun", TRUE) as "surfaceEnCommun",
    ST_AsGeoJSON(ST_MakeValid(ST_Multi(tmp."perimetreGeomEnCommun")))::json as "perimetreEnCommun"
  from (
    select
      t.nom as "titreNom",
      t.slug AS "titreSlug",
      td.id as "demarcheId",
      td.type_id AS "demarcheTypeId",
      t.type_id AS "titreTypeId",
      te.titulaire_ids as "titulaireIds",
      te.geojson4326_perimetre,
      ST_Intersection(te.geojson4326_perimetre, ST_GeomFromGeoJSON($perimetrePivot!)) as "perimetreGeomEnCommun"
    from
        titres_etapes te
        join titres_demarches td on te.titre_demarche_id = td.id
        join titres t on td.titre_id = t.id
    where
        te.demarche_id_en_concurrence = $ demarcheIdPivot !
        and te.archive is false
  ) tmp
  `

const getPerimetreSansSatelliteValidator = z.object({
  perimetre_sans_satellite: multiPolygonValidator.nullable(),
  surface_sans_satellite: m2Validator,
})
const getPerimetreSansSatelliteDb = sql<
  Redefine<IGetPerimetreSansSatelliteDbQuery, { perimetrePivot: DeepReadonly<MultiPolygon>; perimetreSatellite: DeepReadonly<MultiPolygon> }, z.infer<typeof getPerimetreSansSatelliteValidator>>
>`
SELECT
  ST_AREA(perimetre_geom_sans_satellite, TRUE) AS surface_sans_satellite,
  CASE WHEN
    ST_IsEmpty(ST_MakeValid(ST_Multi(perimetre_geom_sans_satellite))) THEN NULL
    ELSE ST_AsGeoJSON(ST_MakeValid(ST_Multi(perimetre_geom_sans_satellite)))::json
  END AS perimetre_sans_satellite
FROM (
  select
    ST_DIFFERENCE(ST_GeomFromGeoJSON($ perimetrePivot !), ST_GeomFromGeoJSON($ perimetreSatellite !)) AS perimetre_geom_sans_satellite
) tmp
`
const getDemarchesValidator = z.object({ id: demarcheIdValidator })
type GetDemarche = z.infer<typeof getDemarchesValidator>
export const getDemarches = (pool: Pool): Effect.Effect<GetDemarche[], CaminoError<EffectDbQueryAndValidateErrors>> => effectDbQueryAndValidate(getDemarchesDb, {}, pool, getDemarchesValidator)

const getDemarchesDb = sql<Redefine<IGetDemarchesDbQuery, {}, GetDemarche>>`
  select td.id from titres_demarches td where td.archive is false`
