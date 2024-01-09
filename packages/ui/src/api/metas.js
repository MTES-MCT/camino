import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'
import { fragmentDocumentType, fragmentEtapeTypeDocumentType } from './fragments/metas'


const documentsTypes = apiGraphQLFetch(
  gql`
    query DocumentsTypes {
      documentsTypes {
        ...documentType
      }
    }

    ${fragmentDocumentType}
  `
)


const etapesTypesDocumentsTypes = apiGraphQLFetch(
  gql`
    query EtapesTypesDocumentsTypes {
      etapesTypesDocumentsTypes {
        ...etapeTypeDocumentType
      }
    }

    ${fragmentEtapeTypeDocumentType}
  `
)

export { documentsTypes, etapesTypesDocumentsTypes }
