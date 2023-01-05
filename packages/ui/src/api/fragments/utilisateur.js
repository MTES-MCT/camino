import gql from 'graphql-tag'

export const fragmentUtilisateur = gql`
  fragment utilisateur on Utilisateur {
    id
    nom
    prenom
    email
    telephoneMobile
    telephoneFixe
    entreprises {
      id
      nom
      paysId
      legalSiren
      legalEtranger
    }
    administrationId
    role
    modification
    suppression
    permissionModification
    utilisateursCreation
  }
`
