/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import {
  IDeleteEntrepriseDocumentQueryQuery,
  IGetEntrepriseDocumentsInternalQuery,
  IGetEntreprisesDbQuery,
  IGetLargeobjectIdByEntrepriseDocumentIdInternalQuery,
  IInsertEntrepriseDocumentInternalQuery,
} from './entreprises.queries.types.js'
import {
  EntrepriseDocument,
  EntrepriseDocumentId,
  EntrepriseId,
  Entreprise,
  entrepriseDocumentIdValidator,
  entrepriseDocumentValidator,
  entrepriseIdValidator,
  entrepriseValidator,
} from 'camino-common/src/entreprise.js'
import { EntrepriseDocumentTypeId } from 'camino-common/src/static/documentsTypes.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { NonEmptyArray, isNonEmptyArray } from 'camino-common/src/typescript-tools.js'
import { Pool } from 'pg'
import { canSeeEntrepriseDocuments } from 'camino-common/src/permissions/entreprises.js'
import { User } from 'camino-common/src/roles.js'
import { z } from 'zod'

const dummy = ['dummy'] as const
export const getEntrepriseDocuments = async (entrepriseDocumentIds: EntrepriseDocumentId[], entrepriseIds: EntrepriseId[], pool: Pool, user: User) => {
  const result = await dbQueryAndValidate(
    getEntrepriseDocumentsInternal,
    {
      entrepriseDocumentIds: isNonEmptyArray(entrepriseDocumentIds) ? entrepriseDocumentIds : dummy,
      entrepriseIds: isNonEmptyArray(entrepriseIds) ? entrepriseIds : dummy,
    },
    pool,
    entrepriseDocumentValidator
  )

  return result.filter(r => canSeeEntrepriseDocuments(user, r.entreprise_id))
}

const getEntrepriseDocumentsInternal = sql<
  Redefine<
    IGetEntrepriseDocumentsInternalQuery,
    { entrepriseDocumentIds: NonEmptyArray<EntrepriseDocumentId> | typeof dummy; entrepriseIds: NonEmptyArray<EntrepriseId> | typeof dummy },
    EntrepriseDocument
  >
>`
select
    d.id,
    d.description,
    d.date,
    d.entreprise_document_type_id,
    d.entreprise_id,
    not exists (
        select
            *
        from
            titres_etapes_entreprises_documents tej
        where
            tej.entreprise_document_id = d.id) as can_delete_document
from
    entreprises_documents d
where ('dummy' in $$ entrepriseDocumentIds
    OR d.id in $$ entrepriseDocumentIds)
AND ('dummy' in $$ entrepriseIds
    OR d.entreprise_id in $$ entrepriseIds)
`

export const entrepriseDocumentLargeObjectIdValidator = z.number().brand('EntrepriseDocumentLargeObjectId')
type EntrepriseDocumentLargeObjectId = z.infer<typeof entrepriseDocumentLargeObjectIdValidator>
const loidByEntrepriseDocumentIdValidator = z.object({ largeobject_id: entrepriseDocumentLargeObjectIdValidator, entreprise_id: entrepriseIdValidator })

export const getLargeobjectIdByEntrepriseDocumentId = async (entrepriseDocumentId: EntrepriseDocumentId, pool: Pool, user: User): Promise<EntrepriseDocumentLargeObjectId | null> => {
  const result = await dbQueryAndValidate(
    getLargeobjectIdByEntrepriseDocumentIdInternal,
    {
      entrepriseDocumentId,
    },
    pool,
    loidByEntrepriseDocumentIdValidator
  )

  if (result.length === 1 && canSeeEntrepriseDocuments(user, result[0].entreprise_id)) {
    return result[0].largeobject_id
  }

  return null
}
const getLargeobjectIdByEntrepriseDocumentIdInternal = sql<
  Redefine<IGetLargeobjectIdByEntrepriseDocumentIdInternalQuery, { entrepriseDocumentId: EntrepriseDocumentId }, z.infer<typeof loidByEntrepriseDocumentIdValidator>>
>`
select
    d.largeobject_id,
    d.entreprise_id
from
    entreprises_documents d
where
    d.id = $ entrepriseDocumentId !
LIMIT 1
`

export const insertEntrepriseDocument = async (
  pool: Pool,
  params: {
    id: EntrepriseDocumentId
    entreprise_document_type_id: EntrepriseDocumentTypeId
    date: CaminoDate
    entreprise_id: EntrepriseId
    description: string
    largeobject_id: number
  }
) => dbQueryAndValidate(insertEntrepriseDocumentInternal, params, pool, z.object({ id: entrepriseDocumentIdValidator }))
const insertEntrepriseDocumentInternal = sql<
  Redefine<
    IInsertEntrepriseDocumentInternalQuery,
    {
      id: EntrepriseDocumentId
      entreprise_document_type_id: EntrepriseDocumentTypeId
      date: CaminoDate
      entreprise_id: EntrepriseId
      description: string
      largeobject_id: number
    },
    { id: EntrepriseDocumentId }
  >
>`
insert into entreprises_documents (id, entreprise_document_type_id, date, entreprise_id, description, largeobject_id)
    values ($ id, $ entreprise_document_type_id, $ date, $ entreprise_id, $ description, $ largeobject_id !)
RETURNING
    id;
`

export const deleteEntrepriseDocument = async (pool: Pool, params: { id: EntrepriseDocumentId; entrepriseId: EntrepriseId }) =>
  dbQueryAndValidate(deleteEntrepriseDocumentQuery, params, pool, z.void())
const deleteEntrepriseDocumentQuery = sql<Redefine<IDeleteEntrepriseDocumentQueryQuery, { id: EntrepriseDocumentId; entrepriseId: EntrepriseId }, void>>`
delete from entreprises_documents
where id = $ id
    and entreprise_id = $ entrepriseId !
`

export const getEntreprises = async (pool: Pool) => {
  return dbQueryAndValidate(getEntreprisesDb, undefined, pool, entrepriseValidator)
}

const getEntreprisesDb = sql<Redefine<IGetEntreprisesDbQuery, void, Entreprise>>`
select
    id,
    nom,
    legal_siren
from
    entreprises
where
    archive is false
`
