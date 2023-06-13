import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'
import {
  fragmentTitreTypeType,
  fragmentTitreStatut,
  fragmentEtapeType,
  fragmentDocumentType,
  fragmentTitreType,
  fragmentTitreTypeDemarcheTypeEtapeType,
  fragmentEtapeTypeDocumentType,
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

export { titresTypesTypes, titresStatuts, etapesTypes, documentsTypes, titresTypes, titresTypesDemarchesTypesEtapesTypes, etapesTypesDocumentsTypes }
