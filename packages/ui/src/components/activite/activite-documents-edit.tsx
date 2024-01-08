import { caminoDefineComponent } from '../../utils/vue-tsx-utils'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { ActiviteDocument, ActiviteDocumentId, TempActiviteDocument } from 'camino-common/src/activite'
import { DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { ApiClient } from '@/api/api-client'
import { ActiviteDocumentLink } from './preview'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { ref, watch } from 'vue'
import { isActiviteDocumentsComplete } from 'camino-common/src/permissions/activites'
import { AddActiviteDocumentPopup } from './add-activite-document-popup'
import { activitesTypesDocumentsTypes } from 'camino-common/src/static/activitesTypesDocumentsTypes'

interface Props {
  apiClient: Pick<ApiClient, 'uploadTempDocument'>
  completeUpdate: (activiteDocumentIds: ActiviteDocumentId[], tempsDocuments: TempActiviteDocument[], complete: boolean) => void
  activiteTypeId: ActivitesTypesId
  activiteDocuments: ActiviteDocument[]
}

const isTempActiviteDocument = (activiteDocument: ActiviteDocument | TempActiviteDocument): activiteDocument is TempActiviteDocument => 'tempDocumentName' in activiteDocument
const isActiviteDocument = (activiteDocument: ActiviteDocument | TempActiviteDocument): activiteDocument is ActiviteDocument => !isTempActiviteDocument(activiteDocument)
export const ActiviteDocumentsEdit = caminoDefineComponent<Props>(['activiteDocuments', 'completeUpdate', 'activiteTypeId', 'apiClient'], props => {
  const addPopup = ref<boolean>(false)

  const documents = ref<(ActiviteDocument | TempActiviteDocument)[]>([])

  const isNotMandatory = isActiviteDocumentsComplete([], props.activiteTypeId).valid

  watch(
    () => props.activiteDocuments,
    () => {
      documents.value = [...props.activiteDocuments]
    },
    { immediate: true }
  )

  const hasDocumentTypes: boolean = activitesTypesDocumentsTypes[props.activiteTypeId].map(({ documentTypeId }) => documentTypeId).length > 0

  const notifyChange = () => {
    const tempActiviteDocuments = documents.value.filter(isTempActiviteDocument)
    const alreadyExistingActiviteDocumentIds = documents.value.filter(isActiviteDocument).map(({ id }) => id)
    props.completeUpdate(alreadyExistingActiviteDocumentIds, tempActiviteDocuments, isActiviteDocumentsComplete(documents.value, props.activiteTypeId).valid)
  }
  notifyChange()

  return () => (
    <div style={{ overflowX: 'auto' }}>
      {hasDocumentTypes ? (
        <div class="fr-table">
          <table style={{ display: 'table' }}>
            <caption>Documents de l'activité {isNotMandatory ? '' : '*'}</caption>
            <thead>
              <tr>
                <th scope="col">Nom</th>
                <th scope="col">Description</th>
                <th scope="col" style={{ display: 'flex', justifyContent: 'end' }}>
                  <DsfrButtonIcon icon="fr-icon-add-line" title="Ajouter un document" onClick={() => (addPopup.value = true)} />
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.value.map((item, index) => (
                <tr>
                  <td>
                    {isTempActiviteDocument(item) ? (
                      <>{DocumentsTypes[item.activite_document_type_id].nom}</>
                    ) : (
                      <ActiviteDocumentLink activiteDocumentId={item.id} activiteDocumentTypeId={item.activite_document_type_id} />
                    )}
                  </td>
                  <td>{item.description}</td>
                  <td>
                    <DsfrButtonIcon
                      icon="fr-icon-delete-bin-line"
                      buttonType="secondary"
                      title={`Supprimer le document ${DocumentsTypes[item.activite_document_type_id].nom}`}
                      onClick={() => {
                        documents.value.splice(index, 1)
                        notifyChange()
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {addPopup.value ? (
        <AddActiviteDocumentPopup
          apiClient={props.apiClient}
          activiteTypeId={props.activiteTypeId}
          close={(tempDocument: TempActiviteDocument | null) => {
            if (tempDocument !== null) {
              documents.value.push(tempDocument)
              notifyChange()
            }
            addPopup.value = false
          }}
        />
      ) : null}
    </div>
  )
})
