import gql from 'graphql-tag'
import { fragmentEntreprises } from './entreprises'

export const fragmentUtilisateur = gql`
  fragment utilisateur on Utilisateur {
    id
    nom
    prenom
    email
    telephoneMobile
    telephoneFixe
    entreprises {
      ...entreprises
    }
    administrationId
    role
    newsletter

    modification
    suppression
    permissionModification
    entreprisesCreation
    utilisateursCreation

    sections {
      activites
      administrations
      utilisateurs
      metas
      journaux
      travaux
    }
  }

  ${fragmentEntreprises}
`
