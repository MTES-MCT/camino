import { EtapeDocumentId, EtapeId, EtapeIdOrSlug, etapeBrouillonValidator, etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape'
import { ETAPE_TYPE_FOR_CONCURRENCY_DATA, EtapeTypeId, etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes'
import { Pool } from 'pg'
import { z } from 'zod'
import { DBNotFound, DbQueryAccessError, Redefine, dbNotFoundError, dbQueryAndValidate, effectDbQueryAndValidate } from '../../pg-database'
import { sql } from '@pgtyped/runtime'
import {
  IGetAdministrationsLocalesByEtapeIdQuery,
  IGetAllDemandesDbQuery,
  IGetDemandesPotentialConcurrenceDbQuery,
  IGetEtapeByDemarcheIdAndEtapeTypeIdDbQuery,
  IGetEtapeByIdDbQuery,
  IGetEtapeDataForEditionDbQuery,
  IGetLargeobjectIdByEtapeDocumentIdInternalQuery,
  IGetTitulairesAmodiatairesTitreEtapeQuery,
} from './etapes.queries.types'
import { DemarcheId, demarcheIdValidator } from 'camino-common/src/demarche'
import { sdomZoneIdValidator } from 'camino-common/src/static/sdom'
import { multiPolygonValidator } from 'camino-common/src/perimetre'
import { DEMARCHES_TYPES_IDS, demarcheTypeIdValidator } from 'camino-common/src/static/demarchesTypes'
import { TitreTypeId, titreTypeIdValidator } from 'camino-common/src/static/titresTypes'
import { AdministrationId, administrationIdValidator } from 'camino-common/src/static/administrations'
import { EntrepriseId, entrepriseIdValidator } from 'camino-common/src/entreprise'
import { User } from 'camino-common/src/roles'
import { LargeObjectId, largeObjectIdValidator } from '../../database/largeobjects'
import { canReadDocument } from './permissions/documents'
import { isNotNullNorUndefinedNorEmpty, memoize, Memoized } from 'camino-common/src/typescript-tools'
import { etapeStatutIdValidator } from 'camino-common/src/static/etapesStatuts'
import { caminoDateValidator } from 'camino-common/src/date'
import { contenuValidator } from './activites.queries'
import { CaminoError } from 'camino-common/src/zod-tools'
import { ZodUnparseable } from '../../tools/fp-tools'
import { Effect, pipe } from 'effect'
import { DATE_DEBUT_PROCEDURE_SPECIFIQUE } from '../../business/rules-demarches/definitions'

const getEtapeByIdValidator = z.object({
  etape_id: etapeIdValidator,
  etape_type_id: etapeTypeIdValidator,
  demarche_id: demarcheIdValidator,
  geojson4326_perimetre: multiPolygonValidator.nullable(),
  sdom_zones: z.array(sdomZoneIdValidator).nullable(),
  demarche_id_en_concurrence: demarcheIdValidator.nullable(),
})
type GetEtapeByIdValidator = z.infer<typeof getEtapeByIdValidator>

export const getEtapeById = (pool: Pool, etapeId: EtapeIdOrSlug): Effect.Effect<GetEtapeByIdValidator, CaminoError<DbQueryAccessError | ZodUnparseable | DBNotFound>> => {
  return pipe(
    effectDbQueryAndValidate(getEtapeByIdDb, { etapeId }, pool, getEtapeByIdValidator),
    Effect.flatMap(result => (result.length === 1 ? Effect.succeed(result[0]) : Effect.fail({ message: dbNotFoundError })))
  )
}

const getEtapeByIdDb = sql<Redefine<IGetEtapeByIdDbQuery, { etapeId: EtapeIdOrSlug }, GetEtapeByIdValidator>>`
select
    id as etape_id,
    type_id as etape_type_id,
    titre_demarche_id as demarche_id,
    ST_AsGeoJSON (geojson4326_perimetre, 40)::json as geojson4326_perimetre,
    sdom_zones,
    demarche_id_en_concurrence
from
    titres_etapes
where (id = $ etapeId !
    or slug = $ etapeId !)
and archive is false
`

const loidByEtapeDocumentIdValidator = z.object({
  largeobject_id: largeObjectIdValidator,
  etape_id: etapeIdValidator,
  public_lecture: z.boolean(),
  entreprises_lecture: z.boolean(),
})
export const getLargeobjectIdByEtapeDocumentId = async (pool: Pool, user: User, etapeDocumentId: EtapeDocumentId): Promise<LargeObjectId | null> => {
  const result = await dbQueryAndValidate(
    getLargeobjectIdByEtapeDocumentIdInternal,
    {
      etapeDocumentId,
    },
    pool,
    loidByEtapeDocumentIdValidator
  )

  if (result.length === 1) {
    const etapeDocument = result[0]
    const { etapeData, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires } = await getEtapeDataForEdition(pool, etapeDocument.etape_id)

    if (
      await canReadDocument(etapeDocument, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, etapeData.etape_type_id, {
        demarche_type_id: etapeData.demarche_type_id,
        entreprises_lecture: etapeData.demarche_entreprises_lecture,
        public_lecture: etapeData.demarche_public_lecture,
        titre_public_lecture: etapeData.titre_public_lecture,
      })
    ) {
      return etapeDocument.largeobject_id
    }
  }

  return null
}
const getLargeobjectIdByEtapeDocumentIdInternal = sql<Redefine<IGetLargeobjectIdByEtapeDocumentIdInternalQuery, { etapeDocumentId: EtapeDocumentId }, z.infer<typeof loidByEtapeDocumentIdValidator>>>`
select
    d.largeobject_id,
    d.etape_id,
    d.public_lecture,
    d.entreprises_lecture
from
    etapes_documents d
where
    d.id = $ etapeDocumentId !
LIMIT 1
`

export const getEtapeDataForEdition = async (
  pool: Pool,
  etapeId: EtapeId
): Promise<{
  etapeData: GetEtapeDataForEdition
  titreTypeId: Memoized<TitreTypeId>
  administrationsLocales: Memoized<AdministrationId[]>
  entreprisesTitulairesOuAmodiataires: Memoized<EntrepriseId[]>
}> => {
  const etapeData = (await dbQueryAndValidate(getEtapeDataForEditionDb, { etapeId }, pool, getEtapeDataForEditionValidator))[0]

  const titreTypeId = memoize(() => Promise.resolve(etapeData.titre_type_id))
  const administrationsLocales = memoize(() => administrationsLocalesByEtapeId(etapeId, pool))
  const entreprisesTitulairesOuAmodiataires = memoize(() => entreprisesTitulairesOuAmoditairesByEtapeId(etapeId, pool))

  return { etapeData, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires }
}

const getEtapeDataForEditionValidator = z.object({
  etape_type_id: etapeTypeIdValidator,
  demarche_id: demarcheIdValidator,
  etape_statut_id: etapeStatutIdValidator,
  demarche_type_id: demarcheTypeIdValidator,
  titre_type_id: titreTypeIdValidator,
  demarche_public_lecture: z.boolean(),
  demarche_entreprises_lecture: z.boolean(),
  titre_public_lecture: z.boolean(),
  etape_slug: etapeSlugValidator,
  etape_is_brouillon: etapeBrouillonValidator,
})

export type GetEtapeDataForEdition = z.infer<typeof getEtapeDataForEditionValidator>

const getEtapeDataForEditionDb = sql<Redefine<IGetEtapeDataForEditionDbQuery, { etapeId: EtapeId }, GetEtapeDataForEdition>>`
select
    te.type_id as etape_type_id,
    te.statut_id as etape_statut_id,
    te.titre_demarche_id as demarche_id,
    td.type_id as demarche_type_id,
    t.type_id as titre_type_id,
    td.public_lecture as demarche_public_lecture,
    td.entreprises_lecture as demarche_entreprises_lecture,
    t.public_lecture as titre_public_lecture,
    te.slug as etape_slug,
    te.is_brouillon as etape_is_brouillon
from
    titres_etapes te
    join titres_demarches td on td.id = te.titre_demarche_id
    join titres t on t.id = td.titre_id
where
    te.id = $ etapeId !
`

const administrationsLocalesByEtapeId = async (etapeId: EtapeId, pool: Pool): Promise<AdministrationId[]> => {
  const admins = await dbQueryAndValidate(getAdministrationsLocalesByEtapeId, { etapeId }, pool, administrationsLocalesValidator)
  if (admins.length > 1) {
    throw new Error(`Trop d'administrations locales trouvées pour l'etape ${etapeId}`)
  }
  if (admins.length === 0) {
    return []
  }

  return admins[0].administrations_locales
}

const administrationsLocalesValidator = z.object({ administrations_locales: z.array(administrationIdValidator) })
const getAdministrationsLocalesByEtapeId = sql<Redefine<IGetAdministrationsLocalesByEtapeIdQuery, { etapeId: EtapeId }, z.infer<typeof administrationsLocalesValidator>>>`
select
    tepoints.administrations_locales
from
    titres_etapes te
    join titres_demarches td on td.id = te.titre_demarche_id
    join titres t on t.id = td.titre_id
    left join titres_etapes tepoints on tepoints.id = t.props_titre_etapes_ids ->> 'points'
where
    te.id = $ etapeId !
`

const entreprisesTitulairesOuAmoditairesByEtapeId = async (etapeId: EtapeId, pool: Pool): Promise<EntrepriseId[]> => {
  const entreprises = await dbQueryAndValidate(getTitulairesAmodiatairesTitreEtape, { etapeId }, pool, entrepriseIdObjectValidator)

  return entreprises.map(({ id }) => id)
}

const entrepriseIdObjectValidator = z.object({ id: entrepriseIdValidator })
const getTitulairesAmodiatairesTitreEtape = sql<Redefine<IGetTitulairesAmodiatairesTitreEtapeQuery, { etapeId: EtapeId }, z.infer<typeof entrepriseIdObjectValidator>>>`
select distinct
    e.id
from
    entreprises e,
    titres_etapes te
    join titres_demarches td on td.id = te.titre_demarche_id
    join titres t on t.id = td.titre_id
    left join titres_etapes etape_titulaires on etape_titulaires.id = t.props_titre_etapes_ids ->> 'titulaires'
    left join titres_etapes etape_amodiataires on etape_amodiataires.id = t.props_titre_etapes_ids ->> 'amodiataires'
where
    te.id = $ etapeId !
    and (etape_titulaires.titulaire_ids ? e.id
        or etape_amodiataires.amodiataire_ids ? e.id)
`

const getEtapeByDemarcheIdAndEtapeTypeIdValidator = z.object({
  etape_id: etapeIdValidator,
  etape_statut_id: etapeStatutIdValidator,
  date: caminoDateValidator,
  contenu: contenuValidator.nullable(),
})
type EtapeByDemarcheIdAndEtapeTypeId = z.infer<typeof getEtapeByDemarcheIdAndEtapeTypeIdValidator>
export const getEtapeByDemarcheIdAndEtapeTypeId = async (pool: Pool, etapeTypeId: EtapeTypeId, demarcheId: DemarcheId): Promise<EtapeByDemarcheIdAndEtapeTypeId | null> => {
  const result = await dbQueryAndValidate(getEtapeByDemarcheIdAndEtapeTypeIdDb, { etapeTypeId, demarcheId }, pool, getEtapeByDemarcheIdAndEtapeTypeIdValidator)

  if (isNotNullNorUndefinedNorEmpty(result)) {
    return result[0]
  }

  return null
}

const getEtapeByDemarcheIdAndEtapeTypeIdDb = sql<Redefine<IGetEtapeByDemarcheIdAndEtapeTypeIdDbQuery, { etapeTypeId: EtapeTypeId; demarcheId: DemarcheId }, EtapeByDemarcheIdAndEtapeTypeId>>`
select
    te.id as etape_id,
    te.statut_id as etape_statut_id,
    te.date,
    te.contenu
from
    titres_etapes te
where
    te.type_id = $ etapeTypeId !
    and te.titre_demarche_id = $ demarcheId !
    and te.archive is false
`

export const getDemandesPotentialConcurrence = (pool: Pool): Effect.Effect<EtapeId[], CaminoError<DbQueryAccessError | ZodUnparseable>> => {
  return pipe(
    effectDbQueryAndValidate(
      getDemandesPotentialConcurrenceDb,
      { demandeTypeId: ETAPE_TYPE_FOR_CONCURRENCY_DATA, dateDebutProcedureSpecifique: DATE_DEBUT_PROCEDURE_SPECIFIQUE, demarcheTypeExtensionDePerimetre: DEMARCHES_TYPES_IDS.ExtensionDePerimetre },
      pool,
      z.object({ id: etapeIdValidator })
    ),
    Effect.map(result => result.map(({ id }) => id))
  )
}

const getDemandesPotentialConcurrenceDb = sql<
  Redefine<
    IGetDemandesPotentialConcurrenceDbQuery,
    {
      demandeTypeId: typeof ETAPE_TYPE_FOR_CONCURRENCY_DATA
      dateDebutProcedureSpecifique: typeof DATE_DEBUT_PROCEDURE_SPECIFIQUE
      demarcheTypeExtensionDePerimetre: typeof DEMARCHES_TYPES_IDS.ExtensionDePerimetre
    },
    { id: EtapeId }
  >
>`
 select te.id
 from titres_etapes te
 join titres_demarches td on td.id = te.titre_demarche_id
 join titres t on t.id = td.titre_id
 left join titres__titres tt on tt.titre_to_id = t.id
 where
    te.type_id = $demandeTypeId !
    and te.date > $dateDebutProcedureSpecifique!
    and te.archive is false
    and te.is_brouillon is false
    and (
      td.type_id = $demarcheTypeExtensionDePerimetre!
      or (
        td.type_id = 'oct'
        and tt is null
      )
    )
  `

export const getAllDemandes = (pool: Pool): Effect.Effect<EtapeId[], CaminoError<DbQueryAccessError | ZodUnparseable>> => {
  return pipe(
    effectDbQueryAndValidate(
      getAllDemandesDb,
      { demandeTypeId: ETAPE_TYPE_FOR_CONCURRENCY_DATA, dateDebutProcedureSpecifique: DATE_DEBUT_PROCEDURE_SPECIFIQUE },
      pool,
      z.object({ id: etapeIdValidator })
    ),
    Effect.map(result => result.map(({ id }) => id))
  )
}

const getAllDemandesDb = sql<
  Redefine<IGetAllDemandesDbQuery, { demandeTypeId: typeof ETAPE_TYPE_FOR_CONCURRENCY_DATA; dateDebutProcedureSpecifique: typeof DATE_DEBUT_PROCEDURE_SPECIFIQUE }, { id: EtapeId }>
>`
 select te.id
 from titres_etapes te
 where
    te.type_id = $demandeTypeId !
    and te.date > $dateDebutProcedureSpecifique!
    and te.archive is false
    and te.is_brouillon is false
  `
