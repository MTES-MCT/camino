import {
  DocumentComplementaireAslEtapeDocumentModification,
  DocumentComplementaireDaeEtapeDocumentModification,
  EtapeDocument,
  EtapeDocumentModification,
  EtapeId,
  GetEtapeDocumentsByEtapeId,
  TempEtapeDocument,
  documentTypeIdComplementaireObligatoireASL,
  documentTypeIdComplementaireObligatoireDAE,
  needAslAndDae,
} from 'camino-common/src/etape'
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
import { EtapesStatuts } from 'camino-common/src/static/etapesStatuts'
import { canDeleteEtapeDocument } from 'camino-common/src/permissions/titres-etapes'
import { getVisibilityLabel } from './etape-documents'
import { AddEtapeDocumentPopup } from './add-etape-document-popup'
import { User } from 'camino-common/src/roles'
import { getDocumentsTypes } from 'camino-common/src/permissions/etape-form'
import { AddEtapeDaeDocumentPopup } from './add-etape-dae-document-popup'
import { AddEtapeAslDocumentPopup } from './add-etape-asl-document-popup'
import { dateFormat } from 'camino-common/src/date'

interface Props {
  tde: {
    titreTypeId: TitreTypeId
    demarcheTypeId: DemarcheTypeId
    etapeTypeId: EtapeTypeId
  }
  isBrouillon: boolean
  sdomZoneIds: DeepReadonly<SDOMZoneId[]>
  completeUpdate: (
    etapeDocuments: (EtapeDocument | TempEtapeDocument)[],
    daeDocument: DocumentComplementaireDaeEtapeDocumentModification | null,
    aslDocument: DocumentComplementaireAslEtapeDocumentModification | null
  ) => void
  etapeId: EtapeId | null
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'getEtapeDocumentsByEtapeId'>
  contenu: DeepReadonly<{ arm?: { mecanise?: boolean } }>
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
      etapeDocuments.value = { status: 'LOADED', value: { etapeDocuments: [], asl: null, dae: null } }
    }
    if (etapeDocuments.value.status === 'LOADED') {
      props.completeUpdate(etapeDocuments.value.value.etapeDocuments, etapeDocuments.value.value.dae, etapeDocuments.value.value.asl)
    }
  })

  return () => <LoadingElement data={etapeDocuments.value} renderItem={items => <EtapeDocumentsLoaded {...items} {...props} />} />
})

type EtapeDocumentsLoadedProps = GetEtapeDocumentsByEtapeId & Props
const EtapeDocumentsLoaded = defineComponent<EtapeDocumentsLoadedProps>(props => {
  const daeDocument = ref<DocumentComplementaireDaeEtapeDocumentModification | null>(props.dae)
  const aslDocument = ref<DocumentComplementaireAslEtapeDocumentModification | null>(props.asl)
  const etapeDocuments = ref<EtapeDocumentModificationWithIndex[]>(props.etapeDocuments.map((document, index) => ({ ...document, index })))

  watch(
    () => [etapeDocuments.value, daeDocument.value, aslDocument.value],
    () => {
      props.completeUpdate(etapeDocuments.value, daeDocument.value, aslDocument.value)
    },
    { deep: true }
  )

  const addOrEditPopupOpen = ref<{ open: true; documentTypeIds: NonEmptyArray<DocumentTypeId>; document?: (EtapeDocument | TempEtapeDocument) & WithIndex } | { open: false }>({ open: false })

  const addOrEditDaePopupOpen = ref<boolean>(false)
  const addOrEditAslPopupOpen = ref<boolean>(false)

  const documentTypes = computed<DocumentType[]>(() => {
    return getDocumentsTypes({ contenu: props.contenu, typeId: props.tde.etapeTypeId }, props.tde.demarcheTypeId, props.tde.titreTypeId, props.sdomZoneIds)
  })

  const needAslAndDaeCompute = computed<boolean>(() => {
    return needAslAndDae(props.tde, props.isBrouillon, props.user)
  })

  const completeRequiredDocuments = computed<PropsTable['documents']>(() => {
    const documents: PropsTable['documents'] = etapeDocuments.value.filter(({ etape_document_type_id }) => documentTypes.value.some(dt => dt.id === etape_document_type_id && !dt.optionnel))

    if (needAslAndDaeCompute.value) {
      if (isNotNullNorUndefined(daeDocument.value)) {
        documents.push({
          ...daeDocument.value,
          index: 'dae',
          description: `${daeDocument.value.description}
- Statut : ${EtapesStatuts[daeDocument.value.etape_statut_id].nom}
- Date : ${dateFormat(daeDocument.value.date)}
- Arrêté : ${daeDocument.value.arrete_prefectoral ?? ''}
`,
        })
      }
      if (isNotNullNorUndefined(aslDocument.value)) {
        documents.push({
          ...aslDocument.value,
          index: 'asl',
          description: `${aslDocument.value.description}
        - Statut : ${EtapesStatuts[aslDocument.value.etape_statut_id].nom}
        - Date : ${dateFormat(aslDocument.value.date)}
        `,
        })
      }
    }

    return documents
  })
  const emptyRequiredDocuments = computed<DocumentTypeId[]>(() => {
    const documents = documentTypes.value
      .filter(({ optionnel, id }) => !optionnel && !completeRequiredDocuments.value.some(({ etape_document_type_id }) => etape_document_type_id === id))
      .map(({ id }) => id)

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

  const closeAddAslPopup = (newDocument: DocumentComplementaireAslEtapeDocumentModification | null) => {
    if (newDocument !== null) {
      aslDocument.value = newDocument
    }

    addOrEditAslPopupOpen.value = false
  }

  const addDocument = (documentTypeId: DocumentTypeId) => {
    if (needAslAndDaeCompute.value && documentTypeId === documentTypeIdComplementaireObligatoireDAE) {
      addOrEditDaePopupOpen.value = true
    } else if (needAslAndDaeCompute.value && documentTypeId === documentTypeIdComplementaireObligatoireASL) {
      addOrEditAslPopupOpen.value = true
    } else {
      addOrEditPopupOpen.value = { open: true, documentTypeIds: [documentTypeId] }
    }
  }
  const editDocument = (documentIndex: number | 'asl' | 'dae') => {
    switch (documentIndex) {
      case 'asl':
        addOrEditAslPopupOpen.value = true
        break
      case 'dae':
        addOrEditDaePopupOpen.value = true
        break
      default: {
        const document = etapeDocuments.value[documentIndex]
        addOrEditPopupOpen.value = { open: true, documentTypeIds: [document.etape_document_type_id], document }
      }
    }
  }
  const removeDocument = (documentIndex: number) => {
    etapeDocuments.value.splice(documentIndex, 1)
  }

  const getNom = (documentTypeId: DocumentTypeId) => {
    if (needAslAndDaeCompute.value && documentTypeId === documentTypeIdComplementaireObligatoireDAE) {
      return `${DocumentsTypes[documentTypeIdComplementaireObligatoireDAE].nom} de la mission autorité environnementale`
    }
    if (needAslAndDaeCompute.value && documentTypeId === documentTypeIdComplementaireObligatoireASL) {
      return `${DocumentsTypes[documentTypeIdComplementaireObligatoireASL].nom} de la décision du propriétaire du sol`
    }

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
          {addOrEditDaePopupOpen.value ? <AddEtapeDaeDocumentPopup apiClient={props.apiClient} close={closeAddDaePopup} initialDocument={daeDocument.value} /> : null}

          {addOrEditAslPopupOpen.value ? <AddEtapeAslDocumentPopup apiClient={props.apiClient} close={closeAddAslPopup} initialDocument={aslDocument.value} /> : null}
        </>
      ) : null}
    </>
  )
})

type PropsTable = {
  caption: string
  documents: ((EtapeDocument | TempEtapeDocument) & { index: number | 'asl' | 'dae' })[]
  isBrouillon: boolean
  emptyRequiredDocuments: DocumentTypeId[]
  getNom: (documentTypeId: DocumentTypeId) => string
  add: (documentTypeId: DocumentTypeId) => void
  edit: (documentIndex: number | 'asl' | 'dae') => void
  delete: (documentIndex: number) => void
}
const EtapeDocumentsTable: FunctionalComponent<PropsTable> = (props: PropsTable) => {
  const deleteDocument = (index: number) => () => {
    props.delete(index)
  }
  const editDocument = (index: number | 'asl' | 'dae') => () => {
    props.edit(index)
  }

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
                  {canDeleteEtapeDocument(props.isBrouillon) && document.index !== 'asl' && document.index !== 'dae' ? (
                    <DsfrButtonIcon
                      icon="fr-icon-delete-bin-line"
                      class="fr-ml-1w"
                      title={`Supprimer le document de ${props.getNom(document.etape_document_type_id)}`}
                      onClick={deleteDocument(document.index)}
                      buttonType="secondary"
                      buttonSize="sm"
                    />
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
          {props.emptyRequiredDocuments.map(documentTypeId => (
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
EtapeDocumentsLoaded.props = ['tde', 'completeUpdate', 'etapeId', 'apiClient', 'sdomZoneIds', 'contenu', 'isBrouillon', 'user', 'asl', 'dae', 'etapeDocuments']
