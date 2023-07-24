import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'

import { fragmentActivite } from './fragments/titre-activite'

const activiteModifier = apiGraphQLFetch(gql`
  mutation ActiviteModifier($activite: InputActiviteModification!) {
    activiteModifier(activite: $activite) {
      id
    }
  }
`)

const activiteDeposer = apiGraphQLFetch(gql`
  mutation ActiviteDeposer($id: ID!) {
    activiteDeposer(id: $id) {
      id
    }
  }
`)

const activiteSupprimer = apiGraphQLFetch(gql`
  mutation ActiviteSupprimer($id: ID!) {
    activiteSupprimer(id: $id) {
      id
    }
  }
`)

const activite = apiGraphQLFetch(
  gql`
    query Activite($id: ID!) {
      activite(id: $id) {
        ...activite
      }
    }

    ${fragmentActivite}
  `
)

export { activite, activiteModifier, activiteSupprimer, activiteDeposer }
