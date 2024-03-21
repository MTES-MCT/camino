import { EtapeDocument, EtapeId } from 'camino-common/src/etape'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { ApiClient } from '../../api/api-client'
import { computed, defineComponent, onMounted, ref } from 'vue'
import { CaminoDate } from 'camino-common/src/date'
import { SDOMZoneId } from 'camino-common/src/static/sdom'
import { getDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { documentTypeIdsBySdomZonesGet } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sdom'
import { DocumentType } from 'camino-common/src/static/documentsTypes'
import { LoadingElement } from '../_ui/functional-loader'
import { AsyncData } from '../../api/client-rest'

// FIXME initialiser la date du document à la date de l’étape
interface Props {
  tde: {
    titreTypeId: TitreTypeId
    demarcheTypeId: DemarcheTypeId
    etapeTypeId: EtapeTypeId
  }
  sdomZoneIds: SDOMZoneId[]
  completeUpdate: (etapeDocuments: unknown[], complete: boolean) => void
  etapeId: EtapeId | undefined
  etapeDate: CaminoDate
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'getEtapeDocumentsByEtapeId'>
  contenu: { arm?: { mecanise?: boolean } } | undefined
}

export const EtapeDocumentsEdit = defineComponent<Props>(props => {
  const documentTypeIds = computed<DocumentType[]>(() => {
    const documentsTypes = getDocuments(props.tde.titreTypeId, props.tde.demarcheTypeId, props.tde.etapeTypeId)

    // si la démarche est mécanisée il faut ajouter des documents obligatoires
    if (isNotNullNorUndefined(props.contenu) && isNotNullNorUndefined(props.contenu.arm)) {
      for (const documentType of documentsTypes) {
        if (['doe', 'dep'].includes(documentType.id)) {
          documentType.optionnel = !(props.contenu.arm.mecanise ?? false)
        }
      }
    }

    const sdomZonesDocumentTypeIds = documentTypeIdsBySdomZonesGet(props.sdomZoneIds, props.tde.titreTypeId, props.tde.demarcheTypeId, props.tde.etapeTypeId)
    if (isNotNullNorUndefinedNorEmpty(sdomZonesDocumentTypeIds)) {
      for (const documentType of documentsTypes) {
        if (sdomZonesDocumentTypeIds.includes(documentType.id)) {
          documentType.optionnel = false
        }
      }
    }

    return documentsTypes
  })

  const etapeDocuments = ref<AsyncData<EtapeDocument[]>>({ status: 'LOADING' })

  const loadEtapeDocuments = async () => {
    if( isNotNullNorUndefined(props.etapeId)){
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

  return () => (
    <LoadingElement
      data={etapeDocuments.value}
      renderItem={items => (
        <>{items.map(i => <div>{i.id} / {i.description}</div>)}</>
      )}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EtapeDocumentsEdit.props = ['tde', 'completeUpdate', 'etapeId', 'apiClient', 'etapeDate', 'sdomZoneIds', 'contenu']
