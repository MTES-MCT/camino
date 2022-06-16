import gql from 'graphql-tag'

const fragmentTitreAdministrations = gql`
  fragment titreAdministrations on Administration {
    id
    nom
    service
    adresse1
    adresse2
    codePostal
    commune
    cedex
    url
    telephone
    email
  }
`

export { fragmentTitreAdministrations }
