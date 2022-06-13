import gql from 'graphql-tag'

const fragmentPermission = gql`
  fragment permission on Permission {
    id
    nom
    ordre
  }
`

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
    couleur
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
    titresCreation
    contenuIds
  }
  ${fragmentTitreTypeType}
`

const fragmentDemarcheStatut = gql`
  fragment demarcheStatut on DemarcheStatut {
    id
    nom
    description
    couleur
    ordre
  }
`

const fragmentUnite = gql`
  fragment unite on Unite {
    id
    nom
    symbole
    referenceUniteId
    referenceUniteRatio
  }
`

const fragmentDemarcheType = gql`
  fragment demarcheType on DemarcheType {
    id
    nom
    description
    ordre
    duree
    points
    substances
    titulaires
    exception
    renouvelable
    demarchesCreation
    titreTypeId
    travaux
  }
`
const fragmentDomaine = gql`
  fragment domaine on Domaine {
    id
    nom
    description
    ordre
  }
`
const fragmentPhaseStatut = gql`
  fragment phaseStatut on PhaseStatut {
    id
    nom
    couleur
  }
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
    etapesStatuts {
      id
      nom
      couleur
    }
    etapesCreation
    documentsTypes {
      ...documentType
    }
    justificatifsTypes {
      ...documentType
    }
  }

  ${fragmentDocumentType}
`

const fragmentEtapeStatut = gql`
  fragment etapeStatut on EtapeStatut {
    id
    nom
    description
    couleur
    ordre
  }
`

const fragmentReferenceType = gql`
  fragment referenceType on ReferenceType {
    id
    nom
  }
`

const fragmentTitreTypeTitreStatut = gql`
  fragment titreTypeTitreStatut on TitreTypeTitreStatut {
    titreTypeId
    titreStatutId
    publicLecture
  }
`

const fragmentTitreTypeDemarcheType = gql`
  fragment titreTypeDemarcheType on TitreTypeDemarcheType {
    titreTypeId
    demarcheTypeId
    dureeMax
    acceptationImplicite
    delaiImplicite
    delaiRecours
    legalRef
    legaleLien
    dateDebut
    dateFin
  }
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

const fragmentTitreTypeDemarcheTypeEtapeTypeDocumentType = gql`
  fragment titreTypeDemarcheTypeEtapeTypeDocumentType on TitreTypeDemarcheTypeEtapeTypeDocumentType {
    titreTypeId
    demarcheTypeId
    etapeTypeId
    documentTypeId
    optionnel
    description
  }
`

const fragmentEtapeTypeEtapeStatut = gql`
  fragment etapeTypeEtapeStatut on EtapeTypeEtapeStatut {
    etapeTypeId
    etapeStatutId
    ordre
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

const fragmentEtapeTypeJustificatifType = gql`
  fragment etapeTypeJustificatifType on EtapeTypeJustificatifType {
    etapeTypeId
    documentTypeId
    optionnel
    description
  }
`

export {
  fragmentTitreTypeType,
  fragmentTitreStatut,
  fragmentEtapeType,
  fragmentEtapeStatut,
  fragmentPermission,
  fragmentUnite,
  fragmentDemarcheType,
  fragmentDemarcheStatut,
  fragmentTitreType,
  fragmentDomaine,
  fragmentPhaseStatut,
  fragmentDocumentType,
  fragmentReferenceType,
  fragmentTitreTypeTitreStatut,
  fragmentTitreTypeDemarcheType,
  fragmentTitreTypeDemarcheTypeEtapeType,
  fragmentTitreTypeDemarcheTypeEtapeTypeDocumentType,
  fragmentEtapeTypeEtapeStatut,
  fragmentEtapeTypeDocumentType,
  fragmentEtapeTypeJustificatifType
}
