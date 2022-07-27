import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'
import {
  fragmentTitreTypeType,
  fragmentTitreStatut,
  fragmentDemarcheType,
  fragmentDemarcheStatut,
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

const titreStatutModifier = apiGraphQLFetch(gql`
  mutation TitreStatutModifier($element: InputTitreStatut!) {
    titreStatutModifier(titreStatut: $element) {
      ...titreStatut
    }
  }

  ${fragmentTitreStatut}
`)

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

const demarcheTypeModifier = apiGraphQLFetch(gql`
  mutation DemarcheTypeModifier($element: InputDemarcheType!) {
    demarcheTypeModifier(demarcheType: $element) {
      ...demarcheType
    }
  }

  ${fragmentDemarcheType}
`)

const demarchesStatuts = apiGraphQLFetch(
  gql`
    query DemarchesStatuts {
      demarchesStatuts {
        ...demarcheStatut
      }
    }

    ${fragmentDemarcheStatut}
  `
)

const demarcheStatutModifier = apiGraphQLFetch(gql`
  mutation DemarcheStatutModifier($element: InputDemarcheStatut!) {
    demarcheStatutModifier(demarcheStatut: $element) {
      ...demarcheStatut
    }
  }

  ${fragmentDemarcheStatut}
`)

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

const phaseStatutModifier = apiGraphQLFetch(gql`
  mutation PhaseStatutModifier($element: InputPhaseStatut!) {
    phaseStatutModifier(phaseStatut: $element) {
      ...phaseStatut
    }
  }

  ${fragmentPhaseStatut}
`)

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

const etapeTypeModifier = apiGraphQLFetch(gql`
  mutation EtapeTypeModifier($element: InputEtapeType!) {
    etapeTypeModifier(etapeType: $element) {
      ...etapeType
    }
  }

  ${fragmentEtapeType}
`)

const substancesLegales = apiGraphQLFetch(
  gql`
    query SubstancesLegales {
      substancesLegales {
        id
        nom
        description
        ordre
      }
    }
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

const documentTypeCreer = apiGraphQLFetch(gql`
  mutation documentTypeCreer($element: InputDocumentType!) {
    documentTypeCreer(documentType: $element) {
      ...documentType
    }
  }

  ${fragmentDocumentType}
`)

const documentTypeModifier = apiGraphQLFetch(gql`
  mutation documentTypeModifier($element: InputDocumentType!) {
    documentTypeModifier(documentType: $element) {
      ...documentType
    }
  }

  ${fragmentDocumentType}
`)

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

const referenceTypeModifier = apiGraphQLFetch(gql`
  mutation ReferenceTypeModifier($element: InputReferenceType!) {
    referenceTypeModifier(referenceType: $element) {
      ...referenceType
    }
  }

  ${fragmentReferenceType}
`)

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

const titreTypeModifier = apiGraphQLFetch(gql`
  mutation TitreTypeModifier($element: InputTitreTypeModification!) {
    titreTypeModifier(titreType: $element) {
      id
      typeId
      domaineId
      titresCreation
      contenuIds
    }
  }
`)

const titreTypeCreer = apiGraphQLFetch(gql`
  mutation TitreTypeCreer($element: InputTitreTypeCreation!) {
    titreTypeCreer(titreType: $element) {
      id
      typeId
      domaineId
      titresCreation
      contenuIds
    }
  }
`)

const titreTypeSupprimer = apiGraphQLFetch(gql`
  mutation TitreTypeSupprimer($element: InputTitreTypeModification!) {
    titreTypeSupprimer(titreType: $element) {
      id
      typeId
      domaineId
      titresCreation
      contenuIds
    }
  }
`)

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

const titreTypeTitreStatutModifier = apiGraphQLFetch(gql`
  mutation TitreTypeTitreStatutModifier($element: InputTitreTypeTitreStatut!) {
    titreTypeTitreStatutModifier(titreTypeTitreStatut: $element) {
      ...titreTypeTitreStatut
    }
  }

  ${fragmentTitreTypeTitreStatut}
`)

const titreTypeTitreStatutCreer = apiGraphQLFetch(gql`
  mutation TitreTypeTitreStatutCreer($element: InputTitreTypeTitreStatut!) {
    titreTypeTitreStatutCreer(titreTypeTitreStatut: $element) {
      ...titreTypeTitreStatut
    }
  }

  ${fragmentTitreTypeTitreStatut}
`)

const titreTypeTitreStatutSupprimer = apiGraphQLFetch(gql`
  mutation titreTypeTitreStatutSupprimer($element: InputTitreTypeTitreStatut!) {
    titreTypeTitreStatutSupprimer(titreTypeTitreStatut: $element) {
      ...titreTypeTitreStatut
    }
  }

  ${fragmentTitreTypeTitreStatut}
`)

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

const titreTypeDemarcheTypeModifier = apiGraphQLFetch(gql`
  mutation TitreTypeDemarcheTypeModifier(
    $element: InputTitreTypeDemarcheType!
  ) {
    titreTypeDemarcheTypeModifier(titreTypeDemarcheType: $element) {
      ...titreTypeDemarcheType
    }
  }

  ${fragmentTitreTypeDemarcheType}
`)

const titreTypeDemarcheTypeCreer = apiGraphQLFetch(gql`
  mutation TitreTypeDemarcheTypeCreer($element: InputTitreTypeDemarcheType!) {
    titreTypeDemarcheTypeCreer(titreTypeDemarcheType: $element) {
      ...titreTypeDemarcheType
    }
  }

  ${fragmentTitreTypeDemarcheType}
`)

const titreTypeDemarcheTypeSupprimer = apiGraphQLFetch(gql`
  mutation TitreTypeDemarcheTypeSupprimer(
    $element: InputTitreTypeDemarcheType!
  ) {
    titreTypeDemarcheTypeSupprimer(titreTypeDemarcheType: $element) {
      ...titreTypeDemarcheType
    }
  }

  ${fragmentTitreTypeDemarcheType}
`)

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

const titreTypeDemarcheTypeEtapeTypeModifier = apiGraphQLFetch(gql`
  mutation TitreTypeDemarcheTypeEtapeTypeModifier(
    $element: InputTitreTypeDemarcheTypeEtapeType!
  ) {
    titreTypeDemarcheTypeEtapeTypeModifier(
      titreTypeDemarcheTypeEtapeType: $element
    ) {
      ...titreTypeDemarcheTypeEtapeType
    }
  }

  ${fragmentTitreTypeDemarcheTypeEtapeType}
`)

const titreTypeDemarcheTypeEtapeTypeCreer = apiGraphQLFetch(gql`
  mutation TitreTypeDemarcheTypeEtapeTypeCreer(
    $element: InputTitreTypeDemarcheTypeEtapeType!
  ) {
    titreTypeDemarcheTypeEtapeTypeCreer(
      titreTypeDemarcheTypeEtapeType: $element
    ) {
      ...titreTypeDemarcheTypeEtapeType
    }
  }

  ${fragmentTitreTypeDemarcheTypeEtapeType}
`)

const titreTypeDemarcheTypeEtapeTypeSupprimer = apiGraphQLFetch(gql`
  mutation TitreTypeDemarcheTypeEtapeTypeSupprimer(
    $element: InputTitreTypeDemarcheTypeEtapeType!
  ) {
    titreTypeDemarcheTypeEtapeTypeSupprimer(
      titreTypeDemarcheTypeEtapeType: $element
    ) {
      ...titreTypeDemarcheTypeEtapeType
    }
  }

  ${fragmentTitreTypeDemarcheTypeEtapeType}
`)

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

const titreTypeDemarcheTypeEtapeTypeDocumentTypeModifier = apiGraphQLFetch(gql`
  mutation TitreTypeDemarcheTypeEtapeTypeDocumentTypeModifier(
    $element: InputTitreTypeDemarcheTypeEtapeTypeDocumentType!
  ) {
    titreTypeDemarcheTypeEtapeTypeDocumentTypeModifier(
      titreTypeDemarcheTypeEtapeTypeDocumentType: $element
    ) {
      ...titreTypeDemarcheTypeEtapeTypeDocumentType
    }
  }

  ${fragmentTitreTypeDemarcheTypeEtapeTypeDocumentType}
`)

const titreTypeDemarcheTypeEtapeTypeDocumentTypeCreer = apiGraphQLFetch(gql`
  mutation TitreTypeDemarcheTypeEtapeTypeDocumentTypeCreer(
    $element: InputTitreTypeDemarcheTypeEtapeTypeDocumentType!
  ) {
    titreTypeDemarcheTypeEtapeTypeDocumentTypeCreer(
      titreTypeDemarcheTypeEtapeTypeDocumentType: $element
    ) {
      ...titreTypeDemarcheTypeEtapeTypeDocumentType
    }
  }

  ${fragmentTitreTypeDemarcheTypeEtapeTypeDocumentType}
`)

const titreTypeDemarcheTypeEtapeTypeDocumentTypeSupprimer = apiGraphQLFetch(gql`
  mutation TitreTypeDemarcheTypeEtapeTypeDocumentTypeSupprimer(
    $element: InputTitreTypeDemarcheTypeEtapeTypeDocumentType!
  ) {
    titreTypeDemarcheTypeEtapeTypeDocumentTypeSupprimer(
      titreTypeDemarcheTypeEtapeTypeDocumentType: $element
    ) {
      ...titreTypeDemarcheTypeEtapeTypeDocumentType
    }
  }

  ${fragmentTitreTypeDemarcheTypeEtapeTypeDocumentType}
`)

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

const titreTypeDemarcheTypeEtapeTypeJustificatifTypeModifier =
  apiGraphQLFetch(gql`
    mutation TitreTypeDemarcheTypeEtapeTypeJustificatifTypeModifier(
      $element: InputTitreTypeDemarcheTypeEtapeTypeDocumentType!
    ) {
      titreTypeDemarcheTypeEtapeTypeJustificatifTypeModifier(
        titreTypeDemarcheTypeEtapeTypeJustificatifType: $element
      ) {
        ...titreTypeDemarcheTypeEtapeTypeDocumentType
      }
    }

    ${fragmentTitreTypeDemarcheTypeEtapeTypeDocumentType}
  `)

const titreTypeDemarcheTypeEtapeTypeJustificatifTypeCreer = apiGraphQLFetch(gql`
  mutation TitreTypeDemarcheTypeEtapeTypeJustificatifTypeCreer(
    $element: InputTitreTypeDemarcheTypeEtapeTypeDocumentType!
  ) {
    titreTypeDemarcheTypeEtapeTypeJustificatifTypeCreer(
      titreTypeDemarcheTypeEtapeTypeJustificatifType: $element
    ) {
      ...titreTypeDemarcheTypeEtapeTypeDocumentType
    }
  }

  ${fragmentTitreTypeDemarcheTypeEtapeTypeDocumentType}
`)

const titreTypeDemarcheTypeEtapeTypeJustificatifTypeSupprimer =
  apiGraphQLFetch(gql`
    mutation TitreTypeDemarcheTypeEtapeTypeJustificatifTypeSupprimer(
      $element: InputTitreTypeDemarcheTypeEtapeTypeDocumentType!
    ) {
      titreTypeDemarcheTypeEtapeTypeJustificatifTypeSupprimer(
        titreTypeDemarcheTypeEtapeTypeJustificatifType: $element
      ) {
        ...titreTypeDemarcheTypeEtapeTypeDocumentType
      }
    }

    ${fragmentTitreTypeDemarcheTypeEtapeTypeDocumentType}
  `)

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

const etapeTypeDocumentTypeModifier = apiGraphQLFetch(gql`
  mutation EtapeTypeDocumentTypeModifier(
    $element: InputEtapeTypeDocumentType!
  ) {
    etapeTypeDocumentTypeModifier(etapeTypeDocumentType: $element) {
      ...etapeTypeDocumentType
    }
  }

  ${fragmentEtapeTypeDocumentType}
`)

const etapeTypeDocumentTypeCreer = apiGraphQLFetch(gql`
  mutation EtapeTypeDocumentTypeCreer($element: InputEtapeTypeDocumentType!) {
    etapeTypeDocumentTypeCreer(etapeTypeDocumentType: $element) {
      ...etapeTypeDocumentType
    }
  }

  ${fragmentEtapeTypeDocumentType}
`)

const etapeTypeDocumentTypeSupprimer = apiGraphQLFetch(gql`
  mutation EtapeTypeDocumentTypeSupprimer(
    $element: InputEtapeTypeDocumentType!
  ) {
    etapeTypeDocumentTypeSupprimer(etapeTypeDocumentType: $element) {
      ...etapeTypeDocumentType
    }
  }

  ${fragmentEtapeTypeDocumentType}
`)

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

const etapeTypeJustificatifTypeModifier = apiGraphQLFetch(gql`
  mutation EtapeTypeJustificatifTypeModifier(
    $element: InputEtapeTypeJustificatifType!
  ) {
    etapeTypeJustificatifTypeModifier(etapeTypeJustificatifType: $element) {
      ...etapeTypeJustificatifType
    }
  }

  ${fragmentEtapeTypeJustificatifType}
`)

const etapeTypeJustificatifTypeCreer = apiGraphQLFetch(gql`
  mutation EtapeTypeJustificatifTypeCreer(
    $element: InputEtapeTypeJustificatifType!
  ) {
    etapeTypeJustificatifTypeCreer(etapeTypeJustificatifType: $element) {
      ...etapeTypeJustificatifType
    }
  }

  ${fragmentEtapeTypeJustificatifType}
`)

const etapeTypeJustificatifTypeSupprimer = apiGraphQLFetch(gql`
  mutation EtapeTypeJustificatifTypeSupprimer(
    $element: InputEtapeTypeJustificatifType!
  ) {
    etapeTypeJustificatifTypeSupprimer(etapeTypeJustificatifType: $element) {
      ...etapeTypeJustificatifType
    }
  }

  ${fragmentEtapeTypeJustificatifType}
`)

export {
  titresTypesTypes,
  titresStatuts,
  titreStatutModifier,
  demarchesTypes,
  demarcheTypeModifier,
  demarchesStatuts,
  demarcheStatutModifier,
  phasesStatuts,
  phaseStatutModifier,
  etapesTypes,
  etapeTypeModifier,
  substancesLegales,
  documentsTypes,
  documentTypeCreer,
  documentTypeModifier,
  referencesTypes,
  referenceTypeModifier,
  titresTypes,
  titreTypeModifier,
  titreTypeCreer,
  titreTypeSupprimer,
  titresTypesTitresStatuts,
  titreTypeTitreStatutModifier,
  titreTypeTitreStatutCreer,
  titreTypeTitreStatutSupprimer,
  titresTypesDemarchesTypes,
  titreTypeDemarcheTypeModifier,
  titreTypeDemarcheTypeCreer,
  titreTypeDemarcheTypeSupprimer,
  titresTypesDemarchesTypesEtapesTypes,
  titreTypeDemarcheTypeEtapeTypeModifier,
  titreTypeDemarcheTypeEtapeTypeCreer,
  titreTypeDemarcheTypeEtapeTypeSupprimer,
  titresTypesDemarchesTypesEtapesTypesDocumentsTypes,
  titreTypeDemarcheTypeEtapeTypeDocumentTypeModifier,
  titreTypeDemarcheTypeEtapeTypeDocumentTypeCreer,
  titreTypeDemarcheTypeEtapeTypeDocumentTypeSupprimer,
  titresTypesDemarchesTypesEtapesTypesJustificatifsTypes,
  titreTypeDemarcheTypeEtapeTypeJustificatifTypeModifier,
  titreTypeDemarcheTypeEtapeTypeJustificatifTypeCreer,
  titreTypeDemarcheTypeEtapeTypeJustificatifTypeSupprimer,
  etapesTypesDocumentsTypes,
  etapeTypeDocumentTypeModifier,
  etapeTypeDocumentTypeCreer,
  etapeTypeDocumentTypeSupprimer,
  etapesTypesJustificatifsTypes,
  etapeTypeJustificatifTypeModifier,
  etapeTypeJustificatifTypeCreer,
  etapeTypeJustificatifTypeSupprimer
}
