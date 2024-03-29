import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'

import { fragmentEtape, fragmentEtapeHeritage } from './fragments/titre-etape'
export const titreEtapeMetas = apiGraphQLFetch(
  gql`
    query TitreEtapeMetas($titreDemarcheId: ID!) {
      demarche(id: $titreDemarcheId) {
        id
        slug
        description
        typeId
        titre {
          id
          slug
          nom
          typeId
        }
      }
    }
  `
)

export const etape = apiGraphQLFetch(gql`
  query Etape($id: ID!) {
    etape(id: $id) {
      ...etape
    }
  }

  ${fragmentEtape}
`)

export const etapeHeritage = apiGraphQLFetch(gql`
  query EtapeHeritage($titreDemarcheId: ID!, $date: String!, $typeId: ID!) {
    etapeHeritage(titreDemarcheId: $titreDemarcheId, date: $date, typeId: $typeId) {
      ...etapeHeritage
    }
  }

  ${fragmentEtapeHeritage}
`)

export const etapeCreer = apiGraphQLFetch(gql`
  mutation EtapeCreer($etape: InputEtapeCreation!) {
    etapeCreer(etape: $etape) {
      id
    }
  }
`)

export const etapeModifier = apiGraphQLFetch(gql`
  mutation EtapeModifier($etape: InputEtapeModification!) {
    etapeModifier(etape: $etape) {
      id
    }
  }
`)

export const etapeDeposer = apiGraphQLFetch(gql`
  mutation EtapeDeposer($id: ID!) {
    etapeDeposer(id: $id) {
      slug
    }
  }
`)
