import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'


export const titres = apiGraphQLFetch(
  gql`
    query Titres(
      $intervalle: Int
      $page: Int
      $colonne: String
      $ordre: String
      $titresIds: [ID!]
      $typesIds: [ID!]
      $domainesIds: [ID!]
      $statutsIds: [ID!]
      $substancesIds: [ID!]
      $noms: String
      $entreprisesIds: [ID!]
      $references: String
      $communes: String
      $departements: [String]
      $regions: [String]
      $facadesMaritimes: [String]
    ) {
      titres(
        intervalle: $intervalle
        page: $page
        colonne: $colonne
        ordre: $ordre
        ids: $titresIds
        typesIds: $typesIds
        domainesIds: $domainesIds
        statutsIds: $statutsIds
        substancesIds: $substancesIds
        noms: $noms
        entreprisesIds: $entreprisesIds
        references: $references
        communes: $communes
        departements: $departements
        regions: $regions
        facadesMaritimes: $facadesMaritimes
      ) {
        elements {
          id
    slug
    nom
    typeId
    titreStatutId
    substances
    activitesEnConstruction
    activitesAbsentes
    titulaires {
      id
    nom
    adresse
    codePostal
    commune
    legalSiren
    legalEtranger
    }
    amodiataires {
      id
    nom
    adresse
    codePostal
    commune
    legalSiren
    legalEtranger
    }
    communes {
      id
    }
    secteursMaritime
    references {
      referenceTypeId
      nom
    }
        }
        total
      }
    }

  `
)

export const titresRechercherByReferences = apiGraphQLFetch(
  gql`
    query Titres($intervalle: Int, $references: String) {
      titres(intervalle: $intervalle, references: $references) {
        elements {
          id
          nom
          typeId
        }
      }
    }
  `,
  'titresRechercherByReferences'
)
