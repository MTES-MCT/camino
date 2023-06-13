import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'
import { fragmentDocument } from './fragments/documents'
import { fragmentDocumentType } from './fragments/metas'

export const documentMetas = apiGraphQLFetch(
  gql`
    query MetasDocument($repertoire: ID, $typeId: ID) {
      documentsTypes(repertoire: $repertoire, typeId: $typeId) {
        ...documentType
      }
    }

    ${fragmentDocumentType}
  `
)

export const documentCreer = apiGraphQLFetch(gql`
  mutation DocumentCreer($document: InputDocumentCreation!) {
    documentCreer(document: $document) {
      ...document
    }
  }

  ${fragmentDocument}
`)

export const documentModifier = apiGraphQLFetch(gql`
  mutation DocumentModifier($document: InputDocumentModification!) {
    documentModifier(document: $document) {
      ...document
    }
  }

  ${fragmentDocument}
`)

export const documentSupprimer = apiGraphQLFetch(gql`
  mutation DocumentSupprimer($id: ID!) {
    documentSupprimer(id: $id)
  }
`)
