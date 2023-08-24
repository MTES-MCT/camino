import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'

import { fragmentActiviteType } from './fragments/metas-activites'

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

export { activitesTypes }
