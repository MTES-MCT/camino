import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'
import { fragmentDocument } from './fragments/documents'

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
