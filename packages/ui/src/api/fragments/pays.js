import gql from 'graphql-tag'

const fragmentPays = gql`
  fragment pays on Pays {
    id
    nom
  }
`

export { fragmentPays }
