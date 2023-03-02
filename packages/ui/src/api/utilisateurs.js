import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'

import { fragmentUtilisateur } from './fragments/utilisateur'
import { fragmentEntreprises } from './fragments/entreprises'

export const utilisateurMetas = apiGraphQLFetch(
  gql`
    query UtilisateurMetas {
      entreprises {
        elements {
          ...entreprises
        }
      }
    }

    ${fragmentEntreprises}
  `
)

export const utilisateur = apiGraphQLFetch(
  gql`
    query Utilisateur($id: ID!) {
      utilisateur(id: $id) {
        ...utilisateur
      }
    }

    ${fragmentUtilisateur}
  `
)

export const utilisateurs = apiGraphQLFetch(
  gql`
    query Utilisateurs(
      $intervalle: Int
      $page: Int
      $colonne: String
      $ordre: String
      $entrepriseIds: [ID]
      $administrationIds: [ID]
      $roles: [ID]
      $noms: String
      $emails: String
    ) {
      utilisateurs(
        intervalle: $intervalle
        page: $page
        colonne: $colonne
        ordre: $ordre
        entrepriseIds: $entrepriseIds
        administrationIds: $administrationIds
        roles: $roles
        noms: $noms
        emails: $emails
      ) {
        elements {
          ...utilisateur
        }
        total
      }
    }

    ${fragmentUtilisateur}
  `
)


export const newsletterInscrire = apiGraphQLFetch(gql`
  mutation NewsletterInscrire($email: String!) {
    newsletterInscrire(email: $email)
  }
`)
