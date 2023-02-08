import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'

import { fragmentDemarches } from './fragments/titres-demarches'

const demarchesMetas = apiGraphQLFetch(
  gql`
    query MetasDemarches($travaux: Boolean) {
      etapesTypes(travaux: $travaux) {
        id
        nom
      }

      entreprises {
        elements {
          id
          nom
        }
      }
    }
  `
)

const demarches = apiGraphQLFetch(
  gql`
    query Demarches(
      $page: Int
      $intervalle: Int
      $colonne: String
      $ordre: String
      $typesIds: [ID!]
      $statutsIds: [ID!]
      $etapesInclues: [InputEtapeFiltre!]
      $etapesExclues: [InputEtapeFiltre!]
      $titresDomainesIds: [ID!]
      $titresTypesIds: [ID!]
      $titresStatutsIds: [ID!]
      $titresIds: [String]
      $titresEntreprisesIds: [String]
      $titresSubstancesIds: [String]
      $titresReferences: String
      $titresTerritoires: String
      $travaux: Boolean
    ) {
      demarches(
        page: $page
        intervalle: $intervalle
        colonne: $colonne
        ordre: $ordre
        typesIds: $typesIds
        statutsIds: $statutsIds
        etapesInclues: $etapesInclues
        etapesExclues: $etapesExclues
        titresDomainesIds: $titresDomainesIds
        titresTypesIds: $titresTypesIds
        titresStatutsIds: $titresStatutsIds
        titresIds: $titresIds
        titresEntreprisesIds: $titresEntreprisesIds
        titresSubstancesIds: $titresSubstancesIds
        titresReferences: $titresReferences
        titresTerritoires: $titresTerritoires
        travaux: $travaux
      ) {
        elements {
          ...demarches
        }
        total
      }
    }

    ${fragmentDemarches}
  `
)


const demarcheSupprimer = apiGraphQLFetch(gql`
  mutation DemarcheSupprimer($id: ID!) {
    demarcheSupprimer(id: $id) {
      slug
    }
  }
`)

export {
  demarchesMetas,
  demarches,
  demarcheSupprimer
}
