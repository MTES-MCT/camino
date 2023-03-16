import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'

import { fragmentTitre, fragmentTitres, fragmentTitresGeo, fragmentTitresGeoPolygon } from './fragments/titre'

const titresMetas = apiGraphQLFetch(
  gql`
    query TitresMetas {
      entreprises {
        elements {
          id
          nom
        }
      }
    }
  `
)

const titre = apiGraphQLFetch(
  gql`
    query Titre($id: ID!) {
      titre(id: $id) {
        ...titre
      }
    }

    ${fragmentTitre}
  `
)

const titresGeoPolygon = apiGraphQLFetch(
  gql`
    query Titres(
      $titresIds: [ID!]
      $typesIds: [ID!]
      $domainesIds: [ID!]
      $statutsIds: [ID!]
      $substancesIds: [ID!]
      $entreprisesIds: [ID!]
      $references: String
      $communes: String
      $departements: [String]
      $regions: [String]
      $facadesMaritimes: [String]
      $perimetre: [Float!]
    ) {
      titres(
        ids: $titresIds
        typesIds: $typesIds
        domainesIds: $domainesIds
        statutsIds: $statutsIds
        substancesIds: $substancesIds
        entreprisesIds: $entreprisesIds
        references: $references
        communes: $communes
        departements: $departements
        regions: $regions
        facadesMaritimes: $facadesMaritimes
        perimetre: $perimetre
        demandeEnCours: true
      ) {
        elements {
          ...titresGeoPolygon
        }
        total
      }
    }

    ${fragmentTitresGeoPolygon}
  `
)

const titresGeo = apiGraphQLFetch(
  gql`
    query Titres(
      $titresIds: [ID!]
      $typesIds: [ID!]
      $domainesIds: [ID!]
      $statutsIds: [ID!]
      $substancesIds: [ID!]
      $entreprisesIds: [ID!]
      $references: String
      $communes: String
      $departements: [String]
      $regions: [String]
      $facadesMaritimes: [String]
      $perimetre: [Float!]
    ) {
      titres(
        ids: $titresIds
        typesIds: $typesIds
        domainesIds: $domainesIds
        statutsIds: $statutsIds
        substancesIds: $substancesIds
        entreprisesIds: $entreprisesIds
        references: $references
        communes: $communes
        departements: $departements
        regions: $regions
        facadesMaritimes: $facadesMaritimes
        perimetre: $perimetre
        demandeEnCours: true
      ) {
        elements {
          ...titresGeo
        }
        total
      }
    }

    ${fragmentTitresGeo}
  `
)

const titres = apiGraphQLFetch(
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
          ...titres
        }
        total
      }
    }

    ${fragmentTitres}
  `
)

const titresRechercherByNom = apiGraphQLFetch(
  gql`
    query Titres($intervalle: Int, $noms: String) {
      titres(intervalle: $intervalle, noms: $noms) {
        elements {
          id
          nom
          typeId
        }
      }
    }
  `,
  'titresRechercherByNom'
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

const titresFiltres = apiGraphQLFetch(
  gql`
    query Titres($titresIds: [ID!]) {
      titres(ids: $titresIds) {
        elements {
          id
          nom
        }
      }
    }
  `,
  'titresFiltres'
)

const titreCreer = apiGraphQLFetch(gql`
  mutation TitreCreer($titre: InputTitreCreation!) {
    titreCreer(titre: $titre) {
      slug
    }
  }
`)

const titreModifier = apiGraphQLFetch(gql`
  mutation TitreModifier($titre: InputTitreModification!) {
    titreModifier(titre: $titre) {
      slug
    }
  }
`)

export { titresMetas, titre, titres, titresGeo, titresGeoPolygon, titreCreer, titreModifier, titresRechercherByNom, titresFiltres }
