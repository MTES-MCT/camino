import gql from 'graphql-tag'

const fragmentDocumentType = gql`
  fragment documentType on DocumentType {
    id
    nom
    optionnel
    description
  }
`

const fragmentEtapeType = gql`
  fragment etapeType on EtapeType {
    id
    parentId
    nom
    description
    ordre
    sections
    legalLien
    legalRef
    dateDebut
    dateFin
    fondamentale
    unique
    acceptationAuto
    publicLecture
    entreprisesLecture
    documentsTypes {
      ...documentType
    }
  }

  ${fragmentDocumentType}
`

const fragmentTitreTypeDemarcheTypeEtapeType = gql`
  fragment titreTypeDemarcheTypeEtapeType on TitreTypeDemarcheTypeEtapeType {
    titreTypeId
    demarcheTypeId
    etapeTypeId
    ordre
    sections
  }
`

const fragmentEtapeTypeDocumentType = gql`
  fragment etapeTypeDocumentType on EtapeTypeDocumentType {
    etapeTypeId
    documentTypeId
    optionnel
    description
  }
`

export { fragmentEtapeType, fragmentDocumentType, fragmentTitreTypeDemarcheTypeEtapeType, fragmentEtapeTypeDocumentType }
