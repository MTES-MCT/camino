import { EtapeDocument, EtapeId, TempEtapeDocument } from 'camino-common/src/etape'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { ApiClient } from '../../api/api-client'
import { FunctionalComponent, computed, defineComponent, onMounted, ref, watch } from 'vue'
import { SDOMZoneId } from 'camino-common/src/static/sdom'
import { getDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents'
import { isNonEmptyArray, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { documentTypeIdsBySdomZonesGet } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sdom'
import { DocumentType, DocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { LoadingElement } from '../_ui/functional-loader'
import { AsyncData } from '../../api/client-rest'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { canDeleteEtapeDocument } from 'camino-common/src/permissions/titres-etapes'
import { getVisibilityLabel } from './etape-documents'
import { Alert } from '../_ui/alert'
import { AddEtapeDocumentPopup } from './add-etape-document-popup'
import { User } from 'camino-common/src/roles'

interface Props {
  tde: {
    titreTypeId: TitreTypeId
    demarcheTypeId: DemarcheTypeId
    etapeTypeId: EtapeTypeId
  }
  etapeStatutId: EtapeStatutId
  sdomZoneIds: SDOMZoneId[]
  completeUpdate: (etapeDocuments: (EtapeDocument | TempEtapeDocument)[], complete: boolean) => void
  etapeId: EtapeId | undefined
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'getEtapeDocumentsByEtapeId'>
  contenu: { arm?: { mecanise?: boolean } } | undefined,
  user: User
}

type WithIndex = {index: number}
export const EtapeDocumentsEdit = defineComponent<Props>(props => {
  const documentTypes = computed<DocumentType[]>(() => {
    const dts = getDocuments(props.tde.titreTypeId, props.tde.demarcheTypeId, props.tde.etapeTypeId)

    // si la démarche est mécanisée il faut ajouter des documents obligatoires
    if (isNotNullNorUndefined(props.contenu) && isNotNullNorUndefined(props.contenu.arm)) {
      for (const documentType of dts) {
        if (['doe', 'dep'].includes(documentType.id)) {
          documentType.optionnel = !(props.contenu.arm.mecanise ?? false)
        }
      }
    }

    const sdomZonesDocumentTypeIds = documentTypeIdsBySdomZonesGet(props.sdomZoneIds, props.tde.titreTypeId, props.tde.demarcheTypeId, props.tde.etapeTypeId)
    if (isNotNullNorUndefinedNorEmpty(sdomZonesDocumentTypeIds)) {
      for (const documentType of dts) {
        if (sdomZonesDocumentTypeIds.includes(documentType.id)) {
          documentType.optionnel = false
        }
      }
    }

    return dts
  })

  const etapeDocuments = ref<AsyncData<((EtapeDocument | TempEtapeDocument) & WithIndex)[]>>({ status: 'LOADING' })

  const loadEtapeDocuments = async () => {
    if (isNotNullNorUndefined(props.etapeId)) {
      etapeDocuments.value = { status: 'LOADING' }
      try {
        const result = await props.apiClient.getEtapeDocumentsByEtapeId(props.etapeId)

        etapeDocuments.value = { status: 'LOADED', value: result.map((document, index) => ({...document, index})) }
      } catch (e: any) {
        console.error('error', e)
        etapeDocuments.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    } else {
      etapeDocuments.value = { status: 'LOADED', value: [] }
    }
  }

  onMounted(async () => {
    await loadEtapeDocuments()
  })

  const requiredDocuments = computed<PropsTable['documents']>(() => {
    if (etapeDocuments.value.status === 'LOADED') {
      const docs: PropsTable['documents'] = etapeDocuments.value.value.filter(({ etape_document_type_id }) => documentTypes.value.some(dt => dt.id === etape_document_type_id && !dt.optionnel))

      const documentLength = etapeDocuments.value.value.length
      docs.push(
        ...documentTypes.value
          .filter(({ optionnel, id }) => !optionnel && !docs.some(({ etape_document_type_id }) => etape_document_type_id === id))
          .map(({ id }, index) => ({ id: null, etape_document_type_id: id, index: index + documentLength }))
      )

      return docs
    }

    return []
  })
  const additionnalDocumentTypeIds = computed<DocumentTypeId[]>(() => {
      return documentTypes.value.filter(dt => dt.optionnel).map(({id}) => id)
  })

  const additionnalDocuments = computed<PropsTable['documents']>(() => {
    if (etapeDocuments.value.status === 'LOADED') {
      return etapeDocuments.value.value.filter(({ etape_document_type_id }) => documentTypes.value.some(dt => dt.id === etape_document_type_id && dt.optionnel))
    }

    return []
  })

  const complete = computed<boolean>(() => {
    return requiredDocuments.value.every(document => !isEmptyRequiredDocument(document))
  })

  const addOrEditPopupOpen = ref<boolean>(false)
  const openAddPopup = () => addOrEditPopupOpen.value = true
  const closeAddPopup = (newDocument: (TempEtapeDocument & Partial<WithIndex>) | null) => {

    if( newDocument !== null && etapeDocuments.value.status === 'LOADED'){
      if( isNullOrUndefined(newDocument.index)){
        etapeDocuments.value.value.push({...newDocument, index: etapeDocuments.value.value.length})
      } else {
        etapeDocuments.value.value[newDocument.index] = {...newDocument, index: newDocument.index}
      }
    }

    addOrEditPopupOpen.value = false
  }

  watch(() => etapeDocuments.value, () => {
    if( etapeDocuments.value.status === 'LOADED'){
      props.completeUpdate(etapeDocuments.value.value.filter(d => !isEmptyRequiredDocument(d)), complete.value)
    }
  }, {deep: true, immediate: true})

  return () => (
    <LoadingElement
      data={etapeDocuments.value}
      renderItem={_items => (
        <>
          { !complete.value ? <Alert title='Il manque des documents obligatoires.' small={true} type='warning'/> : null}

          <EtapeDocumentsTable caption="Documents obligatoires" documents={requiredDocuments.value} etapeStatutId={props.etapeStatutId} />
          { isNonEmptyArray(additionnalDocumentTypeIds.value) ?<> <div style={{display: 'flex', flexDirection: 'column'}} class='fr-mt-3w'>
            <EtapeDocumentsTable caption="Documents complémentaires" documents={additionnalDocuments.value} etapeStatutId={props.etapeStatutId} />
            <DsfrButtonIcon style={{alignSelf: 'end'}} class='fr-mt-1w' icon="fr-icon-add-line" buttonType="secondary" title="Ajouter un document complémentaire" label="Ajouter" onClick={openAddPopup} />
          </div>

          {addOrEditPopupOpen.value ? <AddEtapeDocumentPopup documentTypeIds={additionnalDocumentTypeIds.value} apiClient={props.apiClient} close={closeAddPopup} user={props.user} />: null}
          </> : null}

        </>
      )}
    />
  )
})

type EmptyRequiredDocument = { id: null; etape_document_type_id: DocumentTypeId }
type PropsTable = {
  caption: string
  documents: ((EtapeDocument | TempEtapeDocument | EmptyRequiredDocument) & WithIndex)[]
  etapeStatutId: EtapeStatutId
  edit: (document: (EtapeDocument | TempEtapeDocument | EmptyRequiredDocument) & WithIndex) => void
  delete: (document: (EtapeDocument | TempEtapeDocument | EmptyRequiredDocument) & WithIndex) => void
}
const isEmptyRequiredDocument = (document: EtapeDocument | TempEtapeDocument | EmptyRequiredDocument): document is EmptyRequiredDocument => 'id' in document && document.id === null
const EtapeDocumentsTable: FunctionalComponent<PropsTable> = (props: PropsTable) => {


  return (
    <div class="fr-table fr-mb-0">
      <table style={{ display: 'table' }} >
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
              <td class={isEmptyRequiredDocument(document) ? 'fr-label--disabled' : ''}>{DocumentsTypes[document.etape_document_type_id].nom}</td>
              <td>{!isEmptyRequiredDocument(document) ? document.description : '-'}</td>
              <td>{!isEmptyRequiredDocument(document) ? getVisibilityLabel(document) : '-'}</td>
              <td style={{ display: 'flex', justifyContent: 'end' }}>
                {isEmptyRequiredDocument(document) ? (
                  <DsfrButtonIcon icon="fr-icon-add-line" title="Ajouter un document" onClick={() => props.edit(document)} buttonType="secondary" buttonSize="sm" />
                ) : (
                  <DsfrButtonIcon icon="fr-icon-edit-line" title="Modifier un document" onClick={() => props.edit(document)} buttonType="secondary" buttonSize="sm" />
                )}
                {canDeleteEtapeDocument(props.etapeStatutId) ? (
                  <DsfrButtonIcon icon="fr-icon-delete-bin-line" class="fr-ml-1w" title="Supprimer un document" onClick={() => props.delete(document)} buttonType="secondary" buttonSize="sm" />
                ) : null}
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
