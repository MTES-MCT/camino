import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'

import { fragmentActiviteType, fragmentActiviteTypeDocumentType, fragmentActiviteTypePays } from './fragments/metas-activites'

const activitesTypes = apiGraphQLFetch(
  gql`
    query ActivitesTypes {
      activitesTypes {
        ...activiteType
      }
    }

    ${fragmentActiviteType}
  `
)

const activitesTypesDocumentsTypes = apiGraphQLFetch(
  gql`
    query ActivitesTypesDocumentsTypes {
      activitesTypesDocumentsTypes {
        ...activiteTypeDocumentType
      }
    }

    ${fragmentActiviteTypeDocumentType}
  `
)

export { activitesTypes, activitesTypesDocumentsTypes }
