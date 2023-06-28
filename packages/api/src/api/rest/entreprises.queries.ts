/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { IDeleteEntrepriseDocumentQueryQuery, IGetEntrepriseDocumentsInternalQuery, IInsertEntrepriseDocumentInternalQuery } from './entreprises.queries.types.js'
import { DocumentId, EntrepriseDocument, EntrepriseId, documentIdValidator, entrepriseDocumentValidator } from 'camino-common/src/entreprise.js'
import { EntrepriseDocumentTypeId, FileUploadType } from 'camino-common/src/static/documentsTypes.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { Pool } from 'pg'
import { z } from 'zod'

export const getEntrepriseDocuments = async (pool: Pool, params: { entrepriseId: EntrepriseId }) => {
  return dbQueryAndValidate(getEntrepriseDocumentsInternal, params, pool, entrepriseDocumentValidator)
}
const getEntrepriseDocumentsInternal = sql<Redefine<IGetEntrepriseDocumentsInternalQuery, { entrepriseId: EntrepriseId }, EntrepriseDocument>>`
select
    d.id,
    d.description,
    d.date,
    d.type_id,
    not exists (
        select
            *
        from
            titres_etapes_justificatifs tej
        where
            tej.document_id = d.id) as can_delete_document
from
    documents d
where
    d.entreprise_id = $ entrepriseId
    and d.public_lecture != true
`

export const insertEntrepriseDocument = async (
  pool: Pool,
  params: {
    id: DocumentId
    type_id: EntrepriseDocumentTypeId
    date: CaminoDate
    entreprise_id: EntrepriseId
    description: string
    fichier: true
    fichier_type_id: FileUploadType
    entreprises_lecture: true
    public_lecture: false
  }
) => {
  return dbQueryAndValidate(insertEntrepriseDocumentInternal, params, pool, z.object({ id: documentIdValidator }))
}

const insertEntrepriseDocumentInternal = sql<
  Redefine<
    IInsertEntrepriseDocumentInternalQuery,
    {
      id: DocumentId
      type_id: EntrepriseDocumentTypeId
      date: CaminoDate
      entreprise_id: EntrepriseId
      description: string
      fichier: true
      fichier_type_id: FileUploadType
      entreprises_lecture: true
      public_lecture: false
    },
    { id: DocumentId }
  >
>`
insert into documents (id, type_id, date, entreprise_id, description, fichier, fichier_type_id, entreprises_lecture, public_lecture)
    values ($ id, $ type_id, $ date, $ entreprise_id, $ description, $ fichier, $ fichier_type_id, $ entreprises_lecture, $ public_lecture)
RETURNING
    id;

`

export const deleteEntrepriseDocument = async (pool: Pool, params: { id: DocumentId; entrepriseId: EntrepriseId }) => {
  return dbQueryAndValidate(deleteEntrepriseDocumentQuery, params, pool, z.void())
}
const deleteEntrepriseDocumentQuery = sql<Redefine<IDeleteEntrepriseDocumentQueryQuery, { id: DocumentId; entrepriseId: EntrepriseId }, void>>`
delete from documents
where id = $ id
    and entreprise_id = $ entrepriseId
`
