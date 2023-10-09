import gql from 'graphql-tag'
import { fragmentDocumentType } from './metas'

const fragmentDocument = gql`
  fragment document on Document {
    id
    typeId
    type {
      ...documentType
    }
    date
    description
    fichier
    fichierTypeId
    titreEtapeId
    publicLecture
    entreprisesLecture
    suppression
  }

  ${fragmentDocumentType}
`

export { fragmentDocument }
