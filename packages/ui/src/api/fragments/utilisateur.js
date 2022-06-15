import gql from 'graphql-tag'
import { fragmentEntreprises } from './entreprises'
import { fragmentAdministrations } from './administrations'

const fragmentUtilisateur = gql`
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
    administrations {
      ...administrations
    }
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

  ${fragmentAdministrations}
`

export { fragmentUtilisateur }
