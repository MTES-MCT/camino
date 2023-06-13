import { transaction, Transaction } from 'objection'

import { IDocument, IFields } from '../../types.js'

import options from './_options.js'
import graphBuild from './graph/build.js'
import { fieldsFormat } from './graph/fields-format.js'

import Document from '../models/documents.js'
import { documentsQueryModify } from './permissions/documents.js'
import { User } from 'camino-common/src/roles'
import { DocumentId } from 'camino-common/src/entreprise.js'

const documentGet = async (documentId: string, { fields }: { fields?: IFields }, user: User) => {
  const graph = fields ? graphBuild(fields, 'documents', fieldsFormat) : options.documents.graph

  const q = Document.query().withGraphFetched(graph)

  documentsQueryModify(q, user)

  const document = await q.findById(documentId)

  return document as IDocument
}

const documentsGet = async ({ ids }: { ids?: string[] }, { fields }: { fields?: IFields }, user: User) => {
  const graph = fields ? graphBuild(fields, 'documents', fieldsFormat) : options.documents.graph

  const q = Document.query().withGraphFetched(graph)

  if (ids?.length) {
    q.whereIn('documents.id', ids)
  }

  documentsQueryModify(q, user)

  return q
}

const documentCreate = async (document: IDocument, tr?: Transaction) => Document.query(tr).withGraphFetched(options.documents.graph).insertAndFetch(document)

const documentUpsert = async (document: IDocument, tr?: Transaction) => Document.query(tr).upsertGraph(document, options.documents.update).withGraphFetched(options.documents.graph).returning('*')

const documentUpdate = async (id: DocumentId, props: Partial<IDocument>) =>
  Document.query()
    .withGraphFetched(options.documents.graph)
    .patchAndFetchById(id, { ...props, id })

const documentDelete = async (id: string, tr?: Transaction) => Document.query(tr).deleteById(id).withGraphFetched(options.documents.graph).returning('*')

const documentIdUpdate = async (documentOldId: string, document: IDocument) => {
  const knex = Document.knex()

  return transaction(knex, async tr => {
    await documentDelete(documentOldId, tr)

    return documentUpsert(document, tr)
  })
}

export { documentGet, documentsGet, documentCreate, documentUpdate, documentDelete, documentIdUpdate }
