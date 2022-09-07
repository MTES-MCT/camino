import gql from 'graphql-tag'
import { fragmentDocumentType } from './metas'

const fragmentActiviteType = gql`
  fragment activiteType on ActiviteType {
    id
    nom
    dateDebut
    delaiMois
    ordre
    frequenceId
    sections
    documentsTypes {
      ...documentType
    }
    description
  }

  ${fragmentDocumentType}
`

const fragmentActiviteStatut = gql`
  fragment activiteStatut on ActiviteStatut {
    id
    nom
    couleur
  }
`

const fragmentActiviteTypeDocumentType = gql`
  fragment activiteTypeDocumentType on ActiviteTypeDocumentType {
    activiteTypeId
    documentTypeId
    optionnel
  }
`

const fragmentActiviteTypePays = gql`
  fragment activiteTypePays on ActiviteTypePays {
    activiteTypeId
    paysId
  }
`

export {
  fragmentActiviteType,
  fragmentActiviteStatut,
  fragmentActiviteTypeDocumentType,
  fragmentActiviteTypePays
}
