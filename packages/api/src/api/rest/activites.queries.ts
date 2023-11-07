/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import {
  IDeleteActiviteDocumentQueryQuery,
  IGetActiviteByIdQueryQuery,
  IGetActiviteDocumentIdsInternalQuery,
  IGetActiviteDocumentsInternalQuery,
  IGetAdministrationsLocalesByActiviteIdQuery,
  IGetLargeobjectIdByActiviteDocumentIdInternalQuery,
  IGetTitreTypeIdByActiviteIdQuery,
  IGetTitulairesAmodiatairesTitreActiviteQuery,
  IInsertActiviteDocumentInternalQuery,
  IUpdateActiviteDbQuery,
  IGetActivitesByTitreIdQueryQuery,
  IActiviteDeleteDbQuery,
} from './activites.queries.types.js'
import {
  ActiviteDocument,
  ActiviteDocumentId,
  ActiviteId,
  ActiviteIdOrSlug,
  activiteDocumentIdValidator,
  activiteDocumentValidator,
  activiteIdValidator,
  activiteValidator,
} from 'camino-common/src/activite.js'
import { Pool } from 'pg'
import { canDeleteActiviteDocument, canEditActivite, canReadTitreActivites } from 'camino-common/src/permissions/activites.js'
import { User, UserSuper, isSuper, utilisateurIdValidator } from 'camino-common/src/roles.js'
import { z } from 'zod'
import { EntrepriseId } from 'camino-common/src/entreprise.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { ACTIVITES_STATUTS_IDS, ActivitesStatutId } from 'camino-common/src/static/activitesStatuts.js'
import { CaminoDate, getCurrent } from 'camino-common/src/date.js'
import { TitreId, titreIdValidator } from 'camino-common/src/titres.js'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes.js'
import { SimplePromiseFn } from 'camino-common/src/typescript-tools.js'
import { ActiviteDocumentTypeId } from 'camino-common/src/static/documentsTypes.js'
import { sectionValidator } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { titreTypeIdObjectValidator, administrationsLocalesValidator, entrepriseIdObjectValidator } from './titres.queries.js'

export const entreprisesTitulairesOuAmoditairesByActiviteId = async (activiteId: ActiviteIdOrSlug, pool: Pool) => {
  const entreprises = await dbQueryAndValidate(getTitulairesAmodiatairesTitreActivite, { activiteId }, pool, entrepriseIdObjectValidator)

  return entreprises.map(({ id }) => id)
}

export const titreTypeIdByActiviteId = async (activiteId: ActiviteIdOrSlug, pool: Pool) => {
  const typeIds = await dbQueryAndValidate(getTitreTypeIdByActiviteId, { activiteId }, pool, titreTypeIdObjectValidator)
  if (typeIds.length === 0) {
    throw new Error(`Pas de type de titre trouvé pour l'activité ${activiteId}`)
  }

  return typeIds[0].titre_type_id
}

export const updateActiviteQuery = async (
  pool: Pool,
  user: User,
  activiteId: ActiviteId,
  contenu: Contenu,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  titresAdministrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>
) => {
  if (user === null || user === undefined || !(await canEditActivite(user, titreTypeId, titresAdministrationsLocales, entreprisesTitulairesOuAmodiataires, ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION))) {
    throw new Error("Interdiction d'éditer une activité")
  }
  await dbQueryAndValidate(updateActiviteDb, { userId: user.id, activiteId, dateSaisie: getCurrent(), activiteStatutId: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION, contenu }, pool, z.void())
}

const updateActiviteDb = sql<
  Redefine<IUpdateActiviteDbQuery, { userId: string; dateSaisie: CaminoDate; activiteId: ActiviteId; activiteStatutId: ActivitesStatutId; contenu: Contenu }, void>
>`update titres_activites set utilisateur_id = $userId!, date_saisie = $dateSaisie!, activite_statut_id = $activiteStatutId!, contenu = $contenu! where id = $activiteId;`

export const contenuValidator = z.record(z.string(), z.record(z.string(), z.unknown().optional()).optional()).nullable()

export type Contenu = z.infer<typeof contenuValidator>
const dbActiviteValidator = activiteValidator
  .pick({
    id: true,
    type_id: true,
    activite_statut_id: true,
    date: true,
    annee: true,
    date_saisie: true,
    periode_id: true,
    suppression: true,
    slug: true,
  })
  .extend({
    contenu: contenuValidator,
    sections: z.array(sectionValidator),
    titre_id: titreIdValidator,
    titre_nom: z.string(),
    titre_slug: z.string(),
    utilisateur_id: utilisateurIdValidator.nullable(),
  })

export type DbActivite = z.infer<typeof dbActiviteValidator>
export const getActiviteById = async (
  activiteId: ActiviteIdOrSlug,
  pool: Pool,
  user: User,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  titresAdministrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>
) => {
  const canRead = await canReadTitreActivites(user, titreTypeId, titresAdministrationsLocales, entreprisesTitulairesOuAmodiataires)

  if (!canRead) {
    return null
  }

  const activite = await dbQueryAndValidate(getActiviteByIdQuery, { activiteId }, pool, dbActiviteValidator)
  if (activite.length === 0) {
    throw new Error(`Pas d'activité trouvée pour l'id '${activiteId}'`)
  }

  return { ...activite[0], suppression: canDeleteActivite(activite[0], user) }
}

const getActiviteByIdQuery = sql<Redefine<IGetActiviteByIdQueryQuery, { activiteId: ActiviteIdOrSlug }, DbActivite>>`
select
    ta.*,
    t.slug as titre_slug,
    t.nom as titre_nom
from
    titres_activites ta
    join titres t on t.id = ta.titre_id
where
    ta.id = $ activiteId !
    or ta.slug = $ activiteId !
LIMIT 1
`

const canDeleteActivite = (activite: DbActivite, user: User): boolean => {
  return isSuper(user) && activite.suppression
}

export const activiteDeleteQuery = async (
  activiteId: ActiviteId,
  pool: Pool,
  user: User,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  titresAdministrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>
): Promise<boolean> => {
  const activite = await getActiviteById(activiteId, pool, user, titreTypeId, titresAdministrationsLocales, entreprisesTitulairesOuAmodiataires)

  if (activite !== null && activite.suppression) {
    await dbQueryAndValidate(activiteDocumentDeleteDb, { activiteId }, pool, z.void())
    await dbQueryAndValidate(activiteDeleteDb, { activiteId }, pool, z.void())

    return true
  }

  return false
}

const activiteDeleteDb = sql<Redefine<IActiviteDeleteDbQuery, { activiteId: ActiviteId }, void>>`
delete from titres_activites ta
where ta.id = $ activiteId !
`

const activiteDocumentDeleteDb = sql<Redefine<IActiviteDeleteDbQuery, { activiteId: ActiviteId }, void>>`
delete from activites_documents
where activite_id = $ activiteId !
`
export const getActivitesByTitreId = async (
  titreId: TitreId,
  pool: Pool,
  user: User,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  titresAdministrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>
) => {
  const canRead = await canReadTitreActivites(user, titreTypeId, titresAdministrationsLocales, entreprisesTitulairesOuAmodiataires)

  if (!canRead) {
    return null
  }

  const activites = await dbQueryAndValidate(getActivitesByTitreIdQuery, { titreId }, pool, dbActiviteValidator)

  return activites.map(activite => ({ ...activite, suppression: canDeleteActivite(activite, user) }))
}

const getActivitesByTitreIdQuery = sql<Redefine<IGetActivitesByTitreIdQueryQuery, { titreId: TitreId }, DbActivite>>`
select
    ta.*,
    t.slug as titre_slug,
    t.nom as titre_nom
from
    titres_activites ta
    join titres t on t.id = ta.titre_id
where
    t.id = $ titreId !
`

export const administrationsLocalesByActiviteId = async (activiteId: ActiviteIdOrSlug, pool: Pool) => {
  const admins = await dbQueryAndValidate(getAdministrationsLocalesByActiviteId, { activiteId }, pool, administrationsLocalesValidator)
  if (admins.length > 1) {
    throw new Error(`Trop d'administrations locales trouvées pour l'activité ${activiteId}`)
  }
  if (admins.length === 0) {
    return []
  }

  return admins[0].administrations_locales
}

export const getActiviteDocumentsByActiviteId = async (activiteId: ActiviteId, pool: Pool): Promise<ActiviteDocument[]> => {
  return dbQueryAndValidate(
    getActiviteDocumentsInternal,
    {
      activiteId,
    },
    pool,
    activiteDocumentValidator
  )
}

const getAdministrationsLocalesByActiviteId = sql<Redefine<IGetAdministrationsLocalesByActiviteIdQuery, { activiteId: ActiviteIdOrSlug }, z.infer<typeof administrationsLocalesValidator>>>`
select
    te.administrations_locales
from
    titres_activites ta
    join titres t on t.id = ta.titre_id
    left join titres_etapes te on te.id = t.props_titre_etapes_ids ->> 'points'
where
    ta.id = $ activiteId !
    or ta.slug = $ activiteId !
`

const getTitreTypeIdByActiviteId = sql<Redefine<IGetTitreTypeIdByActiviteIdQuery, { activiteId: ActiviteIdOrSlug }, z.infer<typeof titreTypeIdObjectValidator>>>`
select
    t.type_id as titre_type_id
from
    titres_activites ta
    join titres t on t.id = ta.titre_id
where
    ta.id = $ activiteId !
    or ta.slug = $ activiteId !
`

const getTitulairesAmodiatairesTitreActivite = sql<Redefine<IGetTitulairesAmodiatairesTitreActiviteQuery, { activiteId: ActiviteIdOrSlug }, z.infer<typeof entrepriseIdObjectValidator>>>`
select distinct
    e.id
from
    entreprises e,
    titres_activites ta
    join titres t on t.id = ta.titre_id
    left join titres_titulaires tt on tt.titre_etape_id = t.props_titre_etapes_ids ->> 'titulaires'
    left join titres_amodiataires tta on tta.titre_etape_id = t.props_titre_etapes_ids ->> 'amodiataires'
where (ta.id = $ activiteId !
    or ta.slug = $ activiteId !)
and (tt.entreprise_id = e.id
    or tta.entreprise_id = e.id)
`

const getActiviteDocumentsInternal = sql<Redefine<IGetActiviteDocumentsInternalQuery, { activiteId: ActiviteId }, ActiviteDocument>>`
select
    d.id,
    d.description,
    d.activite_document_type_id
from
    activites_documents d
where
    d.activite_id = $ activiteId !
`

export const deleteActiviteDocument = async (
  id: ActiviteDocumentId,
  activiteDocumentTypeId: ActiviteDocumentTypeId,
  activiteTypeId: ActivitesTypesId,
  activiteStatutId: ActivitesStatutId,
  pool: Pool
) => {
  if (!canDeleteActiviteDocument(activiteDocumentTypeId, activiteTypeId, activiteStatutId)) {
    throw new Error('droits insuffisants')
  }

  return dbQueryAndValidate(deleteActiviteDocumentQuery, { id }, pool, z.void())
}

const deleteActiviteDocumentQuery = sql<Redefine<IDeleteActiviteDocumentQueryQuery, { id: ActiviteDocumentId }, void>>`
delete from activites_documents
where id = $ id !
`

export const insertActiviteDocument = async (
  pool: Pool,
  params: {
    id: ActiviteDocumentId
    activite_document_type_id: ActiviteDocumentTypeId
    date: CaminoDate
    activite_id: ActiviteId
    description: string
    largeobject_id: number
  }
) => dbQueryAndValidate(insertActiviteDocumentInternal, params, pool, z.object({ id: activiteDocumentIdValidator }))

const insertActiviteDocumentInternal = sql<
  Redefine<
    IInsertActiviteDocumentInternalQuery,
    {
      id: ActiviteDocumentId
      activite_document_type_id: ActiviteDocumentTypeId
      date: CaminoDate
      activite_id: ActiviteId
      description: string
      largeobject_id: number
    },
    { id: ActiviteDocumentId }
  >
>`
insert into activites_documents (id, activite_document_type_id, date, activite_id, description, largeobject_id)
    values ($ id !, $ activite_document_type_id !, $ date !, $ activite_id !, $ description !, $ largeobject_id !)
RETURNING
    id;
`

export const activiteDocumentLargeObjectIdValidator = z.number().brand('ActiviteDocumentLargeObjectId')
export type ActiviteDocumentLargeObjectId = z.infer<typeof activiteDocumentLargeObjectIdValidator>
const loidByActiviteDocumentIdValidator = z.object({ largeobject_id: activiteDocumentLargeObjectIdValidator, activite_id: activiteIdValidator })

export const getLargeobjectIdByActiviteDocumentId = async (activiteDocumentId: ActiviteDocumentId, pool: Pool, user: User): Promise<ActiviteDocumentLargeObjectId | null> => {
  const result = await dbQueryAndValidate(
    getLargeobjectIdByActiviteDocumentIdInternal,
    {
      activiteDocumentId,
    },
    pool,
    loidByActiviteDocumentIdValidator
  )

  if (result.length === 1) {
    const activiteDocument = result[0]

    const titreTypeId = () => titreTypeIdByActiviteId(activiteDocument.activite_id, pool)
    const administrationsLocales = () => administrationsLocalesByActiviteId(activiteDocument.activite_id, pool)
    const entreprisesTitulairesOuAmodiataires = () => entreprisesTitulairesOuAmoditairesByActiviteId(activiteDocument.activite_id, pool)
    if (await canReadTitreActivites(user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires)) {
      return result[0].largeobject_id
    }
  }

  return null
}
const getLargeobjectIdByActiviteDocumentIdInternal = sql<
  Redefine<IGetLargeobjectIdByActiviteDocumentIdInternalQuery, { activiteDocumentId: ActiviteDocumentId }, z.infer<typeof loidByActiviteDocumentIdValidator>>
>`
select
    d.largeobject_id,
    d.activite_id
from
    activites_documents d
where
    d.id = $ activiteDocumentId !
LIMIT 1
`

const getActiviteDocumentIdsValidator = z.object({ id: activiteDocumentIdValidator, activite_id: activiteIdValidator })

export const getActiviteDocumentIds = async (pool: Pool, user: UserSuper) => {
  const result = await dbQueryAndValidate(getActiviteDocumentIdsInternal, {}, pool, getActiviteDocumentIdsValidator)
  if (isSuper(user)) {
    return result
  } else {
    throw new Error('Cette fonction est appelée uniquement pour la migration des activités')
  }
}

const getActiviteDocumentIdsInternal = sql<
  // eslint-disable-next-line @typescript-eslint/ban-types
  Redefine<IGetActiviteDocumentIdsInternalQuery, {}, z.infer<typeof getActiviteDocumentIdsValidator>>
>`
select
    d.id,
    d.activite_id
from
    activites_documents d
`
