/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { DemarcheId, DemarcheIdOrSlug } from 'camino-common/src/demarche.js'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { IGetDemarcheByIdOrSlugDbQuery, IGetEtapesByDemarcheIdDbQuery } from './demarches.queries.types.js'
import { z } from 'zod'
import { caminoDateValidator } from 'camino-common/src/date.js'
import { communeValidator } from 'camino-common/src/static/communes.js'
import { secteurMaritimeValidator } from 'camino-common/src/static/facades.js'
import { substanceLegaleIdValidator } from 'camino-common/src/static/substancesLegales.js'
import { etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes.js'
import { etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape.js'
import { etapeStatutIdValidator } from 'camino-common/src/static/etapesStatuts.js'
import { contenuValidator } from './activites.queries.js'
import { sdomZoneIdValidator } from 'camino-common/src/static/sdom.js'
import { foretIdValidator } from 'camino-common/src/static/forets.js'
import { Pool } from 'pg'
import { featureCollectionForagesValidator, featureCollectionPointsValidator, featureMultiPolygonValidator, multiPolygonValidator } from 'camino-common/src/perimetre.js'
import { etapeHeritagePropsValidator } from 'camino-common/src/heritage.js'
import { getDemarcheByIdOrSlugValidator as commonGetDemarcheByIdOrSlugValidator } from 'camino-common/src/titres.js'
import { geoSystemeIdValidator } from 'camino-common/src/static/geoSystemes.js'

const getEtapesByDemarcheIdDbValidator = z.object({
  id: etapeIdValidator,
  slug: etapeSlugValidator,
  date: caminoDateValidator,
  ordre: z.number(),
  notes: z.string().nullable(),
  communes: z.array(communeValidator.pick({ id: true })),
  secteurs_maritime: z.array(secteurMaritimeValidator).nullable(),
  substances: z.array(substanceLegaleIdValidator).nullable(),
  etape_type_id: etapeTypeIdValidator,
  etape_statut_id: etapeStatutIdValidator,
  heritage_props: z.record(etapeHeritagePropsValidator, z.object({ actif: z.boolean() })).nullable(),
  heritage_contenu: z.record(z.string(), z.record(z.string(), z.object({ actif: z.boolean() }))).nullable(),
  date_debut: caminoDateValidator.nullable(),
  date_fin: caminoDateValidator.nullable(),
  duree: z.number().nullable(),
  surface: z.number().nullable(),
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
})

export const getEtapesByDemarcheId = async (pool: Pool, demarcheId: DemarcheId) => {
  return dbQueryAndValidate(getEtapesByDemarcheIdDb, { demarcheId }, pool, getEtapesByDemarcheIdDbValidator)
}
type GetEtapesByDemarcheIdDb = z.infer<typeof getEtapesByDemarcheIdDbValidator>
const getEtapesByDemarcheIdDb = sql<Redefine<IGetEtapesByDemarcheIdDbQuery, { demarcheId: DemarcheId }, GetEtapesByDemarcheIdDb>>`
select
    e.id,
    e.date,
    e.ordre,
    e.notes,
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
    e.geojson_origine_forages
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
