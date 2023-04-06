import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'

import { fragmentEntreprises } from './fragments/entreprises'

export const entreprises = apiGraphQLFetch(gql`
  query Entreprises($intervalle: Int, $page: Int, $colonne: String, $ordre: String, $noms: String, $etapeId: ID) {
    entreprises(intervalle: $intervalle, page: $page, colonne: $colonne, ordre: $ordre, noms: $noms, etapeId: $etapeId) {
      elements {
        ...entreprises
      }
      total
    }
  }

  ${fragmentEntreprises}
`)

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
