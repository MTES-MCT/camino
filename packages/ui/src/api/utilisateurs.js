import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'

import { fragmentUtilisateur } from './fragments/utilisateur'
import { fragmentTitreType } from './fragments/metas'
import { fragmentEntreprises } from './fragments/entreprises'

const userMetas = apiGraphQLFetch(
  gql`
    query MetasUser {
      domaines {
        id
        nom
        titresTypes {
          ...titreType
        }
      }

      entreprisesTitresCreation {
        ...entreprises
      }
    }

    ${fragmentTitreType}

    ${fragmentEntreprises}
  `
)

const utilisateurMetas = apiGraphQLFetch(
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

const utilisateur = apiGraphQLFetch(
  gql`
    query Utilisateur($id: ID!) {
      utilisateur(id: $id) {
        ...utilisateur
      }
    }

    ${fragmentUtilisateur}
  `
)

const utilisateurs = apiGraphQLFetch(
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

const utilisateurCerbereTokenCreer = apiGraphQLFetch(gql`
  mutation UtilisateurCerbereTokenCreer($ticket: String!) {
    utilisateurCerbereConnecter(ticket: $ticket) {
      ...utilisateur
    }
  }

  ${fragmentUtilisateur}
`)

const utilisateurCerbereUrlObtenir = apiGraphQLFetch(gql`
  mutation UtilisateurCerbereUrlObtenir($url: String!) {
    utilisateurCerbereUrlObtenir(url: $url)
  }
`)

const moi = apiGraphQLFetch(gql`
  query Moi {
    moi {
      ...utilisateur
    }
  }

  ${fragmentUtilisateur}
`)

const utilisateurModifier = apiGraphQLFetch(gql`
  mutation UtilisateurModifier($utilisateur: InputUtilisateurModification!) {
    utilisateurModifier(utilisateur: $utilisateur) {
      ...utilisateur
    }
  }

  ${fragmentUtilisateur}
`)

const utilisateurCreer = apiGraphQLFetch(gql`
  mutation UtilisateurCreer(
    $utilisateur: InputUtilisateurCreation!
    $token: String
  ) {
    utilisateurCreer(utilisateur: $utilisateur, token: $token) {
      ...utilisateur
    }
  }

  ${fragmentUtilisateur}
`)

const utilisateurSupprimer = apiGraphQLFetch(gql`
  mutation UtilisateurSupprimer($id: ID!) {
    utilisateurSupprimer(id: $id) {
      ...utilisateur
    }
  }

  ${fragmentUtilisateur}
`)

const newsletterInscrire = apiGraphQLFetch(gql`
  mutation NewsletterInscrire($email: String!) {
    newsletterInscrire(email: $email)
  }
`)

export {
  userMetas,
  utilisateurMetas,
  utilisateur,
  utilisateurs,
  moi,
  utilisateurCerbereTokenCreer,
  utilisateurCerbereUrlObtenir,
  utilisateurModifier,
  utilisateurCreer,
  utilisateurSupprimer,
  newsletterInscrire
}
