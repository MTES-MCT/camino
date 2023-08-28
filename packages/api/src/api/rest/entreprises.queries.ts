/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { IDeleteEntrepriseDocumentQueryQuery, IGetEntrepriseDocumentsInternalQuery, IInsertEntrepriseDocumentInternalQuery } from './entreprises.queries.types.js'
import { EntrepriseDocument, EntrepriseDocumentId, EntrepriseId, entrepriseDocumentIdValidator, entrepriseDocumentValidator } from 'camino-common/src/entreprise.js'
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
    d.largeobject_id,
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
    and entreprise_id = $ entrepriseId
`
