import { FunctionalComponent, defineComponent, onMounted, ref } from 'vue'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { AsyncData, getDownloadRestRoute } from '@/api/client-rest'
import { EntrepriseDocument, EntrepriseDocumentId, EntrepriseId } from 'camino-common/src/entreprise'
import { dateFormat } from 'camino-common/src/date'
import { DocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { AddEntrepriseDocumentPopup } from './add-entreprise-document-popup'
import { canEditEntreprise } from 'camino-common/src/permissions/entreprises'
import { User } from 'camino-common/src/roles'
import { RemoveEntrepriseDocumentPopup } from './remove-entreprise-document-popup'
import { ApiClient } from '@/api/api-client'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

interface Props {
  apiClient: Pick<ApiClient, 'getEntrepriseDocuments' | 'creerEntrepriseDocument' | 'deleteEntrepriseDocument' | 'uploadTempDocument'>
  user: User
  entrepriseId: EntrepriseId
}
export const EntrepriseDocuments = defineComponent<Props>(props => {
  const data = ref<AsyncData<EntrepriseDocument[]>>({ status: 'LOADING' })

  const addPopup = ref<boolean>(false)
  const deletePopup = ref<boolean>(false)
  const deleteDocument = ref<{ nom: string; id: EntrepriseDocumentId } | null>(null)

  const reloadDocuments = async () => {
    data.value = { status: 'LOADING' }
    try {
      const entrepriseDocuments = await props.apiClient.getEntrepriseDocuments(props.entrepriseId)

      data.value = { status: 'LOADED', value: entrepriseDocuments }
    } catch (e: any) {
      data.value = {
        status: 'ERROR',
        message: e.message ?? 'something wrong happened',
      }
    }
  }
  onMounted(async () => {
    await reloadDocuments()
  })

  return () => (
    <div style={{ overflowX: 'auto' }}>
      <div class="fr-container">
        <div class="fr-table">
          <table style={{ display: 'table' }}>
            <caption>Documents de l'entreprise</caption>
            <thead>
              <tr>
                <th scope="col">Nom</th>
                <th scope="col">Date</th>
                <th scope="col">Description</th>
                <th scope="col" style={{ display: 'flex', justifyContent: 'end' }}>
                  {canEditEntreprise(props.user, props.entrepriseId) ? (
                    <DsfrButtonIcon
                      icon="fr-icon-add-line"
                      buttonType="primary"
                      title="Ajouter un document"
                      onClick={() => {
                        addPopup.value = true
                      }}
                    />
                  ) : null}
                </th>
              </tr>
            </thead>
            <tbody>
              <LoadingElement
                data={data.value}
                renderItem={items => (
                  <>
                    {items.map(item => (
                      <tr>
                        <td>
                          <EntrepriseDocumentLink documentId={item.id} documentTypeId={item.entreprise_document_type_id} />
                        </td>
                        <td>{dateFormat(item.date)}</td>
                        <td>{item.description}</td>
                        <td>
                          {item.can_delete_document ? (
                            <button
                              class={['fr-btn', 'fr-icon-delete-line', 'fr-btn--secondary', 'fr-mb-0']}
                              title={`Supprimer le document ${DocumentsTypes[item.entreprise_document_type_id].nom}`}
                              onClick={() => {
                                deleteDocument.value = { nom: DocumentsTypes[item.entreprise_document_type_id].nom, id: item.id }
                                deletePopup.value = true
                              }}
                            />
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              />
            </tbody>
          </table>
        </div>
      </div>
      {addPopup.value ? (
        <AddEntrepriseDocumentPopup
          apiClient={{
            ...props.apiClient,
            creerEntrepriseDocument: async (entrepriseId, entrepriseDocumentInput, tempDocumentName) => {
              const document = await props.apiClient.creerEntrepriseDocument(entrepriseId, entrepriseDocumentInput, tempDocumentName)
              await reloadDocuments()

              return document
            },
          }}
          entrepriseId={props.entrepriseId}
          close={() => {
            addPopup.value = false
          }}
        />
      ) : null}
      {deletePopup.value && deleteDocument.value ? (
        <RemoveEntrepriseDocumentPopup
          apiClient={{
            deleteEntrepriseDocument: async (entrepriseId, documentId) => {
              await props.apiClient.deleteEntrepriseDocument(entrepriseId, documentId)
              await reloadDocuments()
            },
          }}
          entrepriseId={props.entrepriseId}
          entrepriseDocument={deleteDocument.value}
          close={() => {
            addPopup.value = false
            deleteDocument.value = null
          }}
        />
      ) : null}
    </div>
  )
})

type EntrepriseDocumentLinkProps = { documentId: EntrepriseDocumentId; documentTypeId: DocumentTypeId; label?: string }
export const EntrepriseDocumentLink: FunctionalComponent<EntrepriseDocumentLinkProps> = (props: EntrepriseDocumentLinkProps) => {
  const label = isNotNullNorUndefined(props.label) ? props.label : DocumentsTypes[props.documentTypeId].nom

  return (
    <a href={getDownloadRestRoute('/download/entrepriseDocuments/:documentId', { documentId: props.documentId })} title={`Télécharger le document ${label} - nouvelle fenêtre`} target="_blank">
      {label}
    </a>
  )
}

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EntrepriseDocuments.props = ['apiClient', 'entrepriseId', 'user']
