import gql from 'graphql-tag'

export const fragmentCommune = gql`
  fragment commune on Commune {
    id
    nom
  }
`
