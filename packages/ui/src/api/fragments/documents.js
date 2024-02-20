import gql from 'graphql-tag'

const fragmentDocument = gql`
  fragment document on Document {
    id
    typeId
    date
    description
    fichier
    fichierTypeId
    titreEtapeId
    publicLecture
    entreprisesLecture
    suppression
  }
`

export { fragmentDocument }
