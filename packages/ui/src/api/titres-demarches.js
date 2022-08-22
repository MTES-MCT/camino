import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'

import { fragmentDemarcheType } from './fragments/metas'
import { fragmentDemarches } from './fragments/titres-demarches'

const demarchesMetas = apiGraphQLFetch(
  gql`
    query MetasDemarches($travaux: Boolean) {
      types {
        id
        nom
      }

      statuts {
        id
        nom
        couleur
      }

      demarchesTypes(travaux: $travaux) {
        id
        nom
      }

      demarchesStatuts {
        id
        nom
        couleur
      }

      etapesTypes(travaux: $travaux) {
        id
        nom
      }
    }
  `
)

const demarcheMetas = apiGraphQLFetch(
  gql`
    query MetasDemarche($titreId: ID!) {
      demarchesTypes(titreId: $titreId) {
        ...demarcheType
      }
    }

    ${fragmentDemarcheType}
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
      $titresNoms: String
      $titresEntreprises: String
      $titresSubstancesIds: [ID]
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
        titresNoms: $titresNoms
        titresEntreprises: $titresEntreprises
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

const demarcheCreer = apiGraphQLFetch(gql`
  mutation DemarcheCreer($demarche: InputDemarcheCreation!) {
    demarcheCreer(demarche: $demarche) {
      slug
    }
  }
`)

const demarcheModifier = apiGraphQLFetch(gql`
  mutation DemarcheModifier($demarche: InputDemarcheModification!) {
    demarcheModifier(demarche: $demarche) {
      slug
    }
  }
`)

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
  demarcheMetas,
  demarcheCreer,
  demarcheModifier,
  demarcheSupprimer
}
