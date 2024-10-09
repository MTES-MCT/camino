import { sql } from '@pgtyped/runtime'
import { DemarcheId, DemarcheIdOrSlug, demarcheIdValidator, GetDemarcheMiseEnConcurrence } from 'camino-common/src/demarche'
import { EffectDbQueryAndValidateErrors, Redefine, dbQueryAndValidate, effectDbQueryAndValidate } from '../../pg-database'
import { IGetDemarcheByIdOrSlugDbQuery, IGetDemarchesEnConcurrenceDbQuery, IGetEtapesByDemarcheIdDbQuery } from './demarches.queries.types'
import { z } from 'zod'
import { caminoDateValidator } from 'camino-common/src/date'
import { communeValidator } from 'camino-common/src/static/communes'
import { secteurMaritimeValidator } from 'camino-common/src/static/facades'
import { substanceLegaleIdValidator } from 'camino-common/src/static/substancesLegales'
import { etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes'
import { etapeBrouillonValidator, etapeIdValidator, etapeNoteValidator, etapeSlugValidator } from 'camino-common/src/etape'
import { etapeStatutIdValidator } from 'camino-common/src/static/etapesStatuts'
import { contenuValidator } from './activites.queries'
import { sdomZoneIdValidator } from 'camino-common/src/static/sdom'
import { foretIdValidator } from 'camino-common/src/static/forets'
import { Pool } from 'pg'
import { featureCollectionForagesValidator, featureCollectionPointsValidator, featureMultiPolygonValidator, multiPolygonValidator } from 'camino-common/src/perimetre'
import { etapeHeritagePropsValidator } from 'camino-common/src/heritage'
import { getDemarcheByIdOrSlugValidator as commonGetDemarcheByIdOrSlugValidator } from 'camino-common/src/titres'
import { geoSystemeIdValidator } from 'camino-common/src/static/geoSystemes'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { km2Validator } from 'camino-common/src/number'
import { Effect, pipe } from 'effect'
import { CaminoError } from 'camino-common/src/zod-tools'
import { isAdministration, isSuper, User } from 'camino-common/src/roles'
import { DeepReadonly } from 'camino-common/src/typescript-tools'

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
    e.demarche_id_en_concurrence
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

export const getDemarcheByIdOrSlug = async (pool: Pool, idOrSlug: DemarcheIdOrSlug): Promise<z.infer<typeof getDemarcheByIdOrSlugValidator>> => {
  return (await dbQueryAndValidate(getDemarcheByIdOrSlugDb, { idOrSlug }, pool, getDemarcheByIdOrSlugValidator))[0]
}

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
