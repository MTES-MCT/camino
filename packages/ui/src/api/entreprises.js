import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'

export const entreprisesTitresCreation = apiGraphQLFetch(
  gql`
    query EntreprisesTitresCreation {
      entreprisesTitresCreation {
        nom
        id
      }
    }
  `
)
