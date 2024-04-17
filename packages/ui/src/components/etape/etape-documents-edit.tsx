import { DocumentComplementaireDaeEtapeDocumentModification, EtapeDocument, EtapeDocumentModification, EtapeId, GetEtapeDocumentsByEtapeId, TempEtapeDocument, documentTypeIdComplementaireObligatoireASL, documentTypeIdComplementaireObligatoireDAE, needAslAndDae } from 'camino-common/src/etape'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { ApiClient } from '../../api/api-client'
import { DeepReadonly, FunctionalComponent, computed, defineComponent, onMounted, ref, watch } from 'vue'
import { SDOMZoneId } from 'camino-common/src/static/sdom'
import { isNonEmptyArray, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, NonEmptyArray } from 'camino-common/src/typescript-tools'
import { DocumentType, DocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { LoadingElement } from '../_ui/functional-loader'
import { AsyncData } from '../../api/client-rest'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { canDeleteEtapeDocument } from 'camino-common/src/permissions/titres-etapes'
import { getVisibilityLabel } from './etape-documents'
import { AddEtapeDocumentPopup } from './add-etape-document-popup'
import { User } from 'camino-common/src/roles'
import { getDocumentsTypes } from 'camino-common/src/permissions/etape-form'
import { AddEtapeDaeDocumentPopup } from './add-etape-dae-document-popup'

interface Props {
  tde: {
    titreTypeId: TitreTypeId
    demarcheTypeId: DemarcheTypeId
    etapeTypeId: EtapeTypeId
  }
  etapeStatutId: EtapeStatutId
  sdomZoneIds: DeepReadonly<SDOMZoneId[]>
  completeUpdate: (etapeDocuments: (EtapeDocument | TempEtapeDocument)[], daeDocument: DocumentComplementaireDaeEtapeDocumentModification | null) => void
  etapeId: EtapeId | null
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'getEtapeDocumentsByEtapeId'>
  contenu: DeepReadonly<{ arm?: { mecanise?: boolean } }>
  user: User
}

type WithIndex = { index: number }

type EtapeDocumentModificationWithIndex = (EtapeDocumentModification & WithIndex)
export const EtapeDocumentsEdit = defineComponent<Props>(props => {
  
  const etapeDocuments = ref<AsyncData<GetEtapeDocumentsByEtapeId>>({ status: 'LOADING' })

  const loadEtapeDocuments = async () => {
    if (isNotNullNorUndefined(props.etapeId)) {
      etapeDocuments.value = { status: 'LOADING' }
      try {
        const result = await props.apiClient.getEtapeDocumentsByEtapeId(props.etapeId)

        etapeDocuments.value = { status: 'LOADED', value: result}
      } catch (e: any) {
        console.error('error', e)
        etapeDocuments.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    } else {
      etapeDocuments.value = { status: 'LOADED', value: {etapeDocuments: [], asl: null, dae: null} }
    }
  }

  onMounted(async () => {
    await loadEtapeDocuments()
  })

  return () => (
    <LoadingElement
      data={etapeDocuments.value}
      renderItem={items => (<EtapeDocumentsLoaded {...items} {...props} />)}
    />
  )
})

type EtapeDocumentsLoadedProps = GetEtapeDocumentsByEtapeId & Props
const EtapeDocumentsLoaded = defineComponent<EtapeDocumentsLoadedProps>((props) => {

  const daeDocument = ref<DocumentComplementaireDaeEtapeDocumentModification | null>(props.dae)
  const aslDocument = ref<GetEtapeDocumentsByEtapeId['asl']>(props.asl)
  const etapeDocuments = ref<EtapeDocumentModificationWithIndex[]>(props.etapeDocuments.map((document, index) => ({ ...document, index })))

  watch(
    () => [etapeDocuments.value, daeDocument.value],
    () => {
      props.completeUpdate(etapeDocuments.value, daeDocument.value)
    },
    { deep: true }
  )

  const addOrEditPopupOpen = ref<{ open: true; documentTypeIds: NonEmptyArray<DocumentTypeId>; document?: (EtapeDocument | TempEtapeDocument) & WithIndex } | { open: false }>({ open: false })

  const addOrEditDaePopupOpen = ref<boolean>(false)


  const documentTypes = computed<DocumentType[]>(() => {
    return getDocumentsTypes({contenu: props.contenu, typeId: props.tde.etapeTypeId}, props.tde.demarcheTypeId, props.tde.titreTypeId, props.sdomZoneIds)
  })

  const needAslAndDaeCompute = computed<boolean>(() => {
    return needAslAndDae(props.tde, props.etapeStatutId, props.user)
  })


  const completeRequiredDocuments = computed<PropsTable['documents']>(() => {
    const documents: PropsTable['documents'] = etapeDocuments.value.filter(({ etape_document_type_id }) => documentTypes.value.some(dt => dt.id === etape_document_type_id && !dt.optionnel))

    if (needAslAndDaeCompute.value) {
      if (isNotNullNorUndefined(daeDocument.value)) {
        // FIXME inline description
        documents.push({...daeDocument.value, index: 'dae'})
      }
      // FIXME
      // if (isNotNullNorUndefined(aslDocument.value)) {
      //   documents.push({...aslDocument.value, index: 'asl'})
      // }
    }
    return documents

  })
  const emptyRequiredDocuments = computed<DocumentTypeId[]>(() => {
    const documents = documentTypes.value.filter(({ optionnel, id }) => !optionnel && !completeRequiredDocuments.value.some(({ etape_document_type_id }) => etape_document_type_id === id)).map(({ id }) => id)

    if (needAslAndDaeCompute.value) {
      if (isNullOrUndefined(daeDocument.value)) {
        documents.push(documentTypeIdComplementaireObligatoireDAE)
      }
      if (isNullOrUndefined(aslDocument.value)) {
        documents.push(documentTypeIdComplementaireObligatoireASL)
      }
    }

    return documents
  })
  const additionnalDocumentTypeIds = computed<DocumentTypeId[]>(() => {
    return documentTypes.value.filter(dt => dt.optionnel).map(({ id }) => id)
  })

  const additionnalDocuments = computed<PropsTable['documents']>(() => {
      return etapeDocuments.value.filter(({ etape_document_type_id }) => documentTypes.value.some(dt => dt.id === etape_document_type_id && dt.optionnel))

  })
  const openAddPopupAdditionnalDocument = () => {
    if (isNonEmptyArray(additionnalDocumentTypeIds.value)) {
      addOrEditPopupOpen.value = { open: true, documentTypeIds: additionnalDocumentTypeIds.value }
    }
  }
  const closeAddPopup = (newDocument: EtapeDocumentModification | null) => {
    if (newDocument !== null && addOrEditPopupOpen.value.open) {
      const index = addOrEditPopupOpen.value.document?.index
      if (isNullOrUndefined(index)) {
        etapeDocuments.value.push({ ...newDocument, index: etapeDocuments.value.length })
      } else {
        etapeDocuments.value[index] = { ...newDocument, index }
      }
    }

    addOrEditPopupOpen.value = { open: false }
  }

  const closeAddDaePopup = (newDocument: DocumentComplementaireDaeEtapeDocumentModification | null) => {
    if (newDocument !== null) {
      daeDocument.value = newDocument
    }

    addOrEditDaePopupOpen.value = false
  }

  const addDocument = (documentTypeId: DocumentTypeId) => {
    if (needAslAndDaeCompute.value && documentTypeId === documentTypeIdComplementaireObligatoireDAE) {
      addOrEditDaePopupOpen.value = true
      // FIXME ASL
    } else {
      addOrEditPopupOpen.value = { open: true, documentTypeIds: [documentTypeId] }
    }
  }
  const editDocument = (documentIndex: number | 'asl' | 'dae') => {
    console.log('documentIndex', documentIndex)
    switch (documentIndex) {
      case 'asl':
        // FIXME
      case 'dae':
        addOrEditDaePopupOpen.value = true
        break
      default:
        const document = etapeDocuments.value[documentIndex]
        addOrEditPopupOpen.value = { open: true, documentTypeIds: [document.etape_document_type_id], document }
    }
    
  }
  const removeDocument = (documentIndex: number| 'asl' | 'dae') => {
    switch (documentIndex) {
      case 'asl':
      case 'dae':
        // FIXME
        break
      default:
        etapeDocuments.value.splice(documentIndex, 1)
    }
      
  }
  return () => <>
  {isNotNullNorUndefinedNorEmpty(emptyRequiredDocuments.value) || isNotNullNorUndefinedNorEmpty(completeRequiredDocuments.value) ? (
    <EtapeDocumentsTable
      add={addDocument}
      edit={editDocument}
      delete={removeDocument}
      caption="Documents obligatoires"
      emptyRequiredDocuments={emptyRequiredDocuments.value}
      documents={completeRequiredDocuments.value}
      etapeStatutId={props.etapeStatutId}
    />
  ) : null}

  {isNonEmptyArray(additionnalDocumentTypeIds.value) ? (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }} class="fr-mt-3w">
        <EtapeDocumentsTable
          add={addDocument}
          edit={editDocument}
          delete={removeDocument}
          caption="Documents complémentaires"
          emptyRequiredDocuments={[]}
          documents={additionnalDocuments.value}
          etapeStatutId={props.etapeStatutId}
        />
        <DsfrButtonIcon
          style={{ alignSelf: 'end' }}
          class="fr-mt-1w"
          icon="fr-icon-add-line"
          buttonType="secondary"
          title="Ajouter un document complémentaire"
          label="Ajouter"
          onClick={openAddPopupAdditionnalDocument}
        />
      </div>
      {addOrEditPopupOpen.value.open ? (
        <AddEtapeDocumentPopup
          documentTypeIds={addOrEditPopupOpen.value.documentTypeIds}
          apiClient={props.apiClient}
          close={closeAddPopup}
          user={props.user}
          initialDocument={addOrEditPopupOpen.value.document}
        />
      ) : null}
      {addOrEditDaePopupOpen.value ? (
        <AddEtapeDaeDocumentPopup
          apiClient={props.apiClient}
          close={closeAddDaePopup}
          initialDocument={daeDocument.value}
        />
      ) : null}
    </>
  ) : null}
</>
})

type PropsTable = {
  caption: string
  documents: ((EtapeDocument | TempEtapeDocument) & {index: number | 'asl' | 'dae'})[]
  etapeStatutId: EtapeStatutId | null
  emptyRequiredDocuments: DocumentTypeId[]
  add: (documentTypeId: DocumentTypeId) => void
  edit: (documentIndex: number | 'asl' | 'dae') => void
  delete: (documentIndex: number | 'asl' | 'dae') => void
}
const EtapeDocumentsTable: FunctionalComponent<PropsTable> = (props: PropsTable) => {
  return (
    <div class="fr-table fr-mb-0">
      <table style={{ display: 'table' }}>
        <caption>{props.caption}</caption>
        <thead>
          <tr>
            <th scope="col">Nom</th>
            <th scope="col">Description</th>
            <th scope="col">Visibilité</th>
            <th scope="col" style={{ display: 'flex', justifyContent: 'end' }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {props.documents.map(document => (
            <tr>
              <td>{DocumentsTypes[document.etape_document_type_id].nom}</td>
              <td>{document.description}</td>
              <td>{getVisibilityLabel(document)}</td>
              <td style={{ display: 'flex', justifyContent: 'end' }}>
                <DsfrButtonIcon
                  icon="fr-icon-edit-line"
                  title={`Modifier le document de ${DocumentsTypes[document.etape_document_type_id].nom}`}
                  onClick={() => props.edit(document.index)}
                  buttonType="secondary"
                  buttonSize="sm"
                />
                {canDeleteEtapeDocument(props.etapeStatutId) ? (
                  <DsfrButtonIcon
                    icon="fr-icon-delete-bin-line"
                    class="fr-ml-1w"
                    title={`Supprimer le document de ${DocumentsTypes[document.etape_document_type_id].nom}`}
                    onClick={() => props.delete(document.index)}
                    buttonType="secondary"
                    buttonSize="sm"
                  />
                ) : null}
              </td>
            </tr>
          ))}
          {props.emptyRequiredDocuments.map(documentTypeId => (
            <tr>
              <td class="fr-label--disabled">{DocumentsTypes[documentTypeId].nom}</td>
              <td>-</td>
              <td>-</td>
              <td style={{ display: 'flex', justifyContent: 'end' }}>
                <DsfrButtonIcon
                  icon="fr-icon-add-line"
                  title={`Ajouter un document ${DocumentsTypes[documentTypeId].nom}`}
                  onClick={() => props.add(documentTypeId)}
                  buttonType="secondary"
                  buttonSize="sm"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EtapeDocumentsEdit.props = ['tde', 'completeUpdate', 'etapeId', 'apiClient', 'sdomZoneIds', 'contenu', 'etapeStatutId', 'user']
// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EtapeDocumentsLoaded.props = ['tde', 'completeUpdate', 'etapeId', 'apiClient', 'sdomZoneIds', 'contenu', 'etapeStatutId', 'user', 'asl', 'dae', 'etapeDocuments']
