import gql from 'graphql-tag'

const fragmentTitreTypeType = gql`
  fragment titreTypeType on TitreTypeType {
    id
    nom
    description
    ordre
  }
`

const fragmentTitreStatut = gql`
  fragment titreStatut on TitreStatut {
    id
    nom
    description
    ordre
  }
`

const fragmentTitreType = gql`
  fragment titreType on TitreType {
    id
    typeId
    domaineId
    type {
      ...titreTypeType
    }
    domaine {
      id
      nom
    }
  }
  ${fragmentTitreTypeType}
`

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

export { fragmentTitreTypeType, fragmentTitreStatut, fragmentEtapeType, fragmentTitreType, fragmentDocumentType, fragmentTitreTypeDemarcheTypeEtapeType, fragmentEtapeTypeDocumentType }
