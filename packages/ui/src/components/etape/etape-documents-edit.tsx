import { EtapeDocument, EtapeId } from 'camino-common/src/etape'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { ApiClient } from '../../api/api-client'
import { FunctionalComponent, computed, defineComponent, onMounted, ref } from 'vue'
import { CaminoDate } from 'camino-common/src/date'
import { SDOMZoneId } from 'camino-common/src/static/sdom'
import { getDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { documentTypeIdsBySdomZonesGet } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sdom'
import { DocumentType, DocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { LoadingElement } from '../_ui/functional-loader'
import { AsyncData } from '../../api/client-rest'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { canDeleteEtapeDocument } from 'camino-common/src/permissions/titres-etapes'

// FIXME initialiser la date du document à la date de l’étape
interface Props {
  tde: {
    titreTypeId: TitreTypeId
    demarcheTypeId: DemarcheTypeId
    etapeTypeId: EtapeTypeId
  }
  etapeStatutId: EtapeStatutId
  sdomZoneIds: SDOMZoneId[]
  completeUpdate: (etapeDocuments: unknown[], complete: boolean) => void
  etapeId: EtapeId | undefined
  etapeDate: CaminoDate
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'getEtapeDocumentsByEtapeId'>
  contenu: { arm?: { mecanise?: boolean } } | undefined
}

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

  const etapeDocuments = ref<AsyncData<EtapeDocument[]>>({ status: 'LOADING' })

  const loadEtapeDocuments = async () => {
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
      etapeDocuments.value = { status: 'LOADED', value: [] }
    }
  }

  onMounted(async () => {
    await loadEtapeDocuments()
  })

  const requiredDocuments = computed<PropsTable['documents']>(() => {
    if (etapeDocuments.value.status === 'LOADED') {
      const docs: PropsTable['documents'] = etapeDocuments.value.value.filter(({ etape_document_type_id }) => documentTypes.value.some(dt => dt.id === etape_document_type_id && !dt.optionnel))

      docs.push(
        ...documentTypes.value
          .filter(({ optionnel, id }) => !optionnel && !docs.some(({ etape_document_type_id }) => etape_document_type_id === id))
          .map(({ id }) => ({ id: null, etape_document_type_id: id }))
      )

      return docs
    }

    return []
  })
  const additionnalDocuments = computed<PropsTable['documents']>(() => {
    if (etapeDocuments.value.status === 'LOADED') {
      return etapeDocuments.value.value.filter(({ etape_document_type_id }) => documentTypes.value.some(dt => dt.id === etape_document_type_id && dt.optionnel))
    }

    return []
  })

  // FIXME watch etapeDocument pour complete

  return () => (
    <LoadingElement
      data={etapeDocuments.value}
      renderItem={_items => (
        <>
          <EtapeDocumentsTable caption="Documents obligatoires" documents={requiredDocuments.value} etapeStatutId={props.etapeStatutId} />
          <div>
            <EtapeDocumentsTable caption="Documents complémentaires" documents={additionnalDocuments.value} etapeStatutId={props.etapeStatutId} />
            <DsfrButtonIcon icon="fr-icon-add-line" buttonType="secondary" title="Ajouter un document complémentaire" label="Ajouter" onClick={() => console.log('FIXME')} />
          </div>
        </>
      )}
    />
  )
})

type EmptyRequiredDocument = { id: null; etape_document_type_id: DocumentTypeId }
type PropsTable = {
  caption: string
  documents: (EtapeDocument | EmptyRequiredDocument)[]
  etapeStatutId: EtapeStatutId
}
const EtapeDocumentsTable: FunctionalComponent<PropsTable> = (props: PropsTable) => {
  return (
    <div class="fr-table">
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
              <td class={document.id === null ? 'fr-label--disabled' : ''}>{DocumentsTypes[document.etape_document_type_id].nom}</td>
              <td>{document.id !== null ? document.description : '-'}</td>
              <td></td>
              <td style={{ display: 'flex', justifyContent: 'end' }}>
                {document.id === null ? (
                  <DsfrButtonIcon icon="fr-icon-add-line" title="Ajouter un document" onClick={() => console.log('FIXME')} buttonType="secondary" buttonSize="sm" />
                ) : (
                  <DsfrButtonIcon icon="fr-icon-edit-line" title="Modifier un document" onClick={() => console.log('FIXME')} buttonType="secondary" buttonSize="sm" />
                )}
                {canDeleteEtapeDocument(props.etapeStatutId) ? (
                  <DsfrButtonIcon icon="fr-icon-delete-bin-line" class="fr-ml-1w" title="Supprimer un document" onClick={() => console.log('FIXME')} buttonType="secondary" buttonSize="sm" />
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
EtapeDocumentsEdit.props = ['tde', 'completeUpdate', 'etapeId', 'apiClient', 'etapeDate', 'sdomZoneIds', 'contenu', 'etapeStatutId']
