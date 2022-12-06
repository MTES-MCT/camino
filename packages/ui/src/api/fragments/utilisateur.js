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
    modification
    suppression
    permissionModification
    utilisateursCreation
  }

  ${fragmentEntreprises}
`
