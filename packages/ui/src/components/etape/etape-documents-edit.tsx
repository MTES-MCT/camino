import { EtapeBrouillon, EtapeDocument, EtapeDocumentModification, EtapeId, GetEtapeDocumentsByEtapeId, TempEtapeDocument } from 'camino-common/src/etape'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { ApiClient } from '../../api/api-client'
import { FunctionalComponent, computed, defineComponent, onMounted, ref, watch } from 'vue'
import { SDOMZoneId } from 'camino-common/src/static/sdom'
import { isNonEmptyArray, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, NonEmptyArray } from 'camino-common/src/typescript-tools'
import { AutreDocumentType, AutreDocumentTypeId, DocumentType, DocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { LoadingElement } from '../_ui/functional-loader'
import { AsyncData } from '../../api/client-rest'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { getVisibilityLabel, sortDocumentsColumn } from './etape-documents'
import { AddEtapeDocumentPopup } from './add-etape-document-popup'
import { User } from 'camino-common/src/roles'
import { getDocumentsTypes } from 'camino-common/src/permissions/etape-form'
import { FirstEtapeDate } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'

interface Props {
  tde: {
    titreTypeId: TitreTypeId
    demarcheTypeId: DemarcheTypeId
    etapeTypeId: EtapeTypeId
    demarcheId: DemarcheId
    firstEtapeDate: FirstEtapeDate
  }
  isBrouillon: EtapeBrouillon
  sdomZoneIds: SDOMZoneId[]
  completeUpdate: (etapeDocuments: (EtapeDocument | TempEtapeDocument)[]) => void
  etapeId: EtapeId | null
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'getEtapeDocumentsByEtapeId'>
  contenu: { arm?: { mecanise?: { value: boolean } } }
  user: User
}

type WithIndex = { index: number }

type EtapeDocumentModificationWithIndex = EtapeDocumentModification & WithIndex
export const EtapeDocumentsEdit = defineComponent<Props>(props => {
  const etapeDocuments = ref<AsyncData<GetEtapeDocumentsByEtapeId>>({ status: 'LOADING' })

  onMounted(async () => {
    if (isNotNullNorUndefined(props.etapeId)) {
      etapeDocuments.value = { status: 'LOADING' }
      try {
        const result = await props.apiClient.getEtapeDocumentsByEtapeId(props.etapeId)

        etapeDocuments.value = { status: 'LOADED', value: result }
      } catch (e: any) {
        console.error('error', e)
        etapeDocuments.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    } else {
      etapeDocuments.value = { status: 'LOADED', value: { etapeDocuments: [] } }
    }
    if (etapeDocuments.value.status === 'LOADED') {
      props.completeUpdate(etapeDocuments.value.value.etapeDocuments)
    }
  })

  return () => <LoadingElement data={etapeDocuments.value} renderItem={items => <EtapeDocumentsLoaded {...items} {...props} />} />
})

type EtapeDocumentsLoadedProps = GetEtapeDocumentsByEtapeId & Props
const EtapeDocumentsLoaded = defineComponent<EtapeDocumentsLoadedProps>(props => {
  const etapeDocuments = ref<EtapeDocumentModificationWithIndex[]>(props.etapeDocuments.map((document, index) => ({ ...document, index })))

  watch(
    () => etapeDocuments.value,
    () => {
      props.completeUpdate(etapeDocuments.value)
    },
    { deep: true }
  )

  const addOrEditPopupOpen = ref<{ open: true; documentTypeIds: NonEmptyArray<DocumentTypeId | AutreDocumentTypeId>; document?: (EtapeDocument | TempEtapeDocument) & WithIndex } | { open: false }>({
    open: false,
  })

  const documentTypes = computed<(DocumentType | AutreDocumentType)[]>(() => {
    return getDocumentsTypes(
      { typeId: props.tde.etapeTypeId },
      props.tde.demarcheTypeId,
      props.tde.titreTypeId,
      props.tde.demarcheId,
      props.sdomZoneIds,
      props.contenu.arm?.mecanise?.value === true,
      props.tde.firstEtapeDate
    )
  })

  const completeRequiredDocuments = computed<PropsTable['documents']>(() => {
    const documents: PropsTable['documents'] = etapeDocuments.value.filter(({ etape_document_type_id }) => documentTypes.value.some(dt => dt.id === etape_document_type_id && !dt.optionnel))

    return documents
  })
  const emptyRequiredDocuments = computed<(DocumentTypeId | AutreDocumentTypeId)[]>(() => {
    const documents = documentTypes.value
      .filter(({ optionnel, id }) => !optionnel && !completeRequiredDocuments.value.some(({ etape_document_type_id }) => etape_document_type_id === id))
      .map(({ id }) => id)

    return documents
  })
  const additionnalDocumentTypeIds = computed<(DocumentTypeId | AutreDocumentTypeId)[]>(() => {
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

  const addDocument = (documentTypeId: DocumentTypeId | AutreDocumentTypeId) => {
    addOrEditPopupOpen.value = { open: true, documentTypeIds: [documentTypeId] }
  }
  const editDocument = (documentIndex: number) => {
    const document = etapeDocuments.value[documentIndex]
    addOrEditPopupOpen.value = { open: true, documentTypeIds: [document.etape_document_type_id], document }
  }
  const removeDocument = (documentIndex: number) => {
    etapeDocuments.value.splice(documentIndex, 1)
    // On recalcule les index
    etapeDocuments.value.forEach((a, index) => {
      a.index = index
    })
  }

  const getNom = (documentTypeId: DocumentTypeId | AutreDocumentTypeId) => {
    return DocumentsTypes[documentTypeId].nom
  }

  return () => (
    <>
      {isNotNullNorUndefinedNorEmpty(emptyRequiredDocuments.value) || isNotNullNorUndefinedNorEmpty(completeRequiredDocuments.value) ? (
        <EtapeDocumentsTable
          getNom={getNom}
          add={addDocument}
          edit={editDocument}
          delete={removeDocument}
          caption="Documents obligatoires"
          emptyRequiredDocuments={emptyRequiredDocuments.value}
          documents={completeRequiredDocuments.value}
          isBrouillon={props.isBrouillon}
          user={props.user}
        />
      ) : null}

      {isNonEmptyArray(additionnalDocumentTypeIds.value) ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column' }} class="fr-mt-3w">
            <EtapeDocumentsTable
              getNom={getNom}
              add={addDocument}
              edit={editDocument}
              delete={removeDocument}
              caption="Documents complémentaires"
              emptyRequiredDocuments={[]}
              documents={additionnalDocuments.value}
              isBrouillon={props.isBrouillon}
              user={props.user}
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
        </>
      ) : null}

      {addOrEditPopupOpen.value.open ? (
        <AddEtapeDocumentPopup
          documentTypeIds={addOrEditPopupOpen.value.documentTypeIds}
          apiClient={props.apiClient}
          close={closeAddPopup}
          user={props.user}
          initialDocument={addOrEditPopupOpen.value.document}
        />
      ) : null}
    </>
  )
})

type PropsTable = {
  caption: string
  documents: ((EtapeDocument | TempEtapeDocument) & { index: number })[]
  isBrouillon: EtapeBrouillon
  emptyRequiredDocuments: (DocumentTypeId | AutreDocumentTypeId)[]
  getNom: (documentTypeId: DocumentTypeId | AutreDocumentTypeId) => string
  add: (documentTypeId: DocumentTypeId | AutreDocumentTypeId) => void
  edit: (documentIndex: number) => void
  delete: (documentIndex: number) => void
  user: User
}
const EtapeDocumentsTable: FunctionalComponent<PropsTable> = (props: PropsTable) => {
  const deleteDocument = (index: number) => () => {
    props.delete(index)
  }
  const editDocument = (index: number) => () => {
    props.edit(index)
  }
  const sortedDocuments = computed(() => sortDocumentsColumn(props.documents.map(d => ({ ...d, document_type_id: d.etape_document_type_id }))))
  const sortedEmptyRequiredDocuments = computed(() => [...props.emptyRequiredDocuments].sort((a, b) => DocumentsTypes[a].nom.localeCompare(DocumentsTypes[b].nom)))

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
          {sortedDocuments.value.map(document => (
            <tr>
              <td>{props.getNom(document.etape_document_type_id)}</td>
              <td style={{ whiteSpace: 'pre-line' }}>{document.description}</td>
              <td>{getVisibilityLabel(document)}</td>
              <td>
                <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
                  <DsfrButtonIcon
                    icon="fr-icon-edit-line"
                    title={`Modifier le document de ${props.getNom(document.etape_document_type_id)}`}
                    onClick={editDocument(document.index)}
                    buttonType="secondary"
                    buttonSize="sm"
                  />
                  <DsfrButtonIcon
                    icon="fr-icon-delete-bin-line"
                    class="fr-ml-1w"
                    title={`Supprimer le document de ${props.getNom(document.etape_document_type_id)}`}
                    onClick={deleteDocument(document.index)}
                    buttonType="secondary"
                    buttonSize="sm"
                  />
                </div>
              </td>
            </tr>
          ))}
          {sortedEmptyRequiredDocuments.value.map(documentTypeId => (
            <tr>
              <td class="fr-label--disabled">{props.getNom(documentTypeId)}</td>
              <td>-</td>
              <td>-</td>
              <td style={{ display: 'flex', justifyContent: 'end' }}>
                <DsfrButtonIcon
                  icon="fr-icon-add-line"
                  title={`Ajouter un document ${props.getNom(documentTypeId)}`}
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
EtapeDocumentsEdit.props = ['tde', 'completeUpdate', 'etapeId', 'apiClient', 'sdomZoneIds', 'contenu', 'isBrouillon', 'user']
// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EtapeDocumentsLoaded.props = ['tde', 'completeUpdate', 'etapeId', 'apiClient', 'sdomZoneIds', 'contenu', 'isBrouillon', 'user', 'etapeDocuments']
