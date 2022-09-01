import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'
import {
  fragmentTitreTypeType,
  fragmentTitreStatut,
  fragmentDemarcheType,
  fragmentPhaseStatut,
  fragmentEtapeType,
  fragmentDocumentType,
  fragmentReferenceType,
  fragmentTitreType,
  fragmentTitreTypeTitreStatut,
  fragmentTitreTypeDemarcheType,
  fragmentTitreTypeDemarcheTypeEtapeType,
  fragmentEtapeTypeDocumentType,
  fragmentEtapeTypeJustificatifType,
  fragmentTitreTypeDemarcheTypeEtapeTypeDocumentType
} from './fragments/metas'

const titresTypesTypes = apiGraphQLFetch(
  gql`
    query TitresTypesTypes {
      types {
        ...titreTypeType
      }
    }

    ${fragmentTitreTypeType}
  `
)

const titresStatuts = apiGraphQLFetch(
  gql`
    query Statuts {
      statuts {
        ...titreStatut
      }
    }

    ${fragmentTitreStatut}
  `
)

const demarchesTypes = apiGraphQLFetch(
  gql`
    query DemarchesTypes {
      demarchesTypes {
        ...demarcheType
      }
    }

    ${fragmentDemarcheType}
  `
)

const phasesStatuts = apiGraphQLFetch(
  gql`
    query PhasesStatuts {
      phasesStatuts {
        ...phaseStatut
      }
    }

    ${fragmentPhaseStatut}
  `
)

const etapesTypes = apiGraphQLFetch(
  gql`
    query EtapesTypes {
      etapesTypes {
        ...etapeType
      }
    }

    ${fragmentEtapeType}
  `
)

const documentsTypes = apiGraphQLFetch(
  gql`
    query DocumentsTypes {
      documentsTypes {
        ...documentType
      }
    }

    ${fragmentDocumentType}
  `
)

const referencesTypes = apiGraphQLFetch(
  gql`
    query ReferencesTypes {
      referencesTypes {
        ...referenceType
      }
    }

    ${fragmentReferenceType}
  `
)

const titresTypes = apiGraphQLFetch(
  gql`
    query TitresTypes {
      titresTypes {
        ...titreType
      }
    }

    ${fragmentTitreType}
  `
)

// tables de jointure

const titresTypesTitresStatuts = apiGraphQLFetch(
  gql`
    query TitresTypesTitresStatuts {
      titresTypesTitresStatuts {
        ...titreTypeTitreStatut
      }
    }

    ${fragmentTitreTypeTitreStatut}
  `
)

const titresTypesDemarchesTypes = apiGraphQLFetch(
  gql`
    query TitresTypesDemarchesTypes {
      titresTypesDemarchesTypes {
        ...titreTypeDemarcheType
      }
    }

    ${fragmentTitreTypeDemarcheType}
  `
)

const titresTypesDemarchesTypesEtapesTypes = apiGraphQLFetch(
  gql`
    query TitresTypesDemarchesTypesEtapesTypes {
      titresTypesDemarchesTypesEtapesTypes {
        ...titreTypeDemarcheTypeEtapeType
      }
    }

    ${fragmentTitreTypeDemarcheTypeEtapeType}
  `
)

const titresTypesDemarchesTypesEtapesTypesDocumentsTypes = apiGraphQLFetch(
  gql`
    query titresTypesDemarchesTypesEtapesTypesDocumentsTypes {
      titresTypesDemarchesTypesEtapesTypesDocumentsTypes {
        ...titreTypeDemarcheTypeEtapeTypeDocumentType
      }
    }

    ${fragmentTitreTypeDemarcheTypeEtapeTypeDocumentType}
  `
)

const titresTypesDemarchesTypesEtapesTypesJustificatifsTypes = apiGraphQLFetch(
  gql`
    query titresTypesDemarchesTypesEtapesTypesJustificatifsTypes {
      titresTypesDemarchesTypesEtapesTypesJustificatifsTypes {
        ...titreTypeDemarcheTypeEtapeTypeDocumentType
      }
    }

    ${fragmentTitreTypeDemarcheTypeEtapeTypeDocumentType}
  `
)

const etapesTypesDocumentsTypes = apiGraphQLFetch(
  gql`
    query EtapesTypesDocumentsTypes {
      etapesTypesDocumentsTypes {
        ...etapeTypeDocumentType
      }
    }

    ${fragmentEtapeTypeDocumentType}
  `
)

const etapesTypesJustificatifsTypes = apiGraphQLFetch(
  gql`
    query EtapesTypesJustificatifsTypes {
      etapesTypesJustificatifsTypes {
        ...etapeTypeJustificatifType
      }
    }

    ${fragmentEtapeTypeJustificatifType}
  `
)

export {
  titresTypesTypes,
  titresStatuts,
  demarchesTypes,
  phasesStatuts,
  etapesTypes,
  documentsTypes,
  referencesTypes,
  titresTypes,
  titresTypesTitresStatuts,
  titresTypesDemarchesTypes,
  titresTypesDemarchesTypesEtapesTypes,
  titresTypesDemarchesTypesEtapesTypesDocumentsTypes,
  titresTypesDemarchesTypesEtapesTypesJustificatifsTypes,
  etapesTypesDocumentsTypes,
  etapesTypesJustificatifsTypes
}
