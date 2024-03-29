import { Transaction } from 'objection'

import { IDocument } from '../../types.js'

import options, { FieldsDocument } from './_options.js'
import graphBuild from './graph/build.js'
import { fieldsFormat } from './graph/fields-format.js'

import Document from '../models/documents.js'
import { documentsQueryModify } from './permissions/documents.js'
import { User } from 'camino-common/src/roles'
import { DocumentId } from 'camino-common/src/entreprise.js'

export const documentGet = async (documentId: string, { fields }: { fields?: FieldsDocument }, user: User): Promise<IDocument | null> => {
  const graph = fields ? graphBuild(fields, 'documents', fieldsFormat) : options.documents.graph

  const q = Document.query().withGraphFetched(graph)

  documentsQueryModify(q, user)

  const document = await q.findById(documentId)

  return document as IDocument | null
}

export const documentsGet = async ({ ids }: { ids?: string[] }, { fields }: { fields?: FieldsDocument }, user: User) => {
  const graph = fields ? graphBuild(fields, 'documents', fieldsFormat) : options.documents.graph

  const q = Document.query().withGraphFetched(graph)

  if (ids?.length) {
    q.whereIn('documents.id', ids)
  }

  documentsQueryModify(q, user)

  return q
}

export const documentCreate = async (document: IDocument, tr?: Transaction) => Document.query(tr).withGraphFetched(options.documents.graph).insertAndFetch(document)

export const documentUpdate = async (id: DocumentId, props: Partial<IDocument>) =>
  Document.query()
    .withGraphFetched(options.documents.graph)
    .patchAndFetchById(id, { ...props, id })

export const documentDelete = async (id: string, tr?: Transaction) => Document.query(tr).deleteById(id).withGraphFetched(options.documents.graph).returning('*')
