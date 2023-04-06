import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { onMounted, ref } from 'vue'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { AsyncData, getUiRestRoute } from '@/api/client-rest'
import { EntrepriseApiClient } from './entreprise-api-client'
import { DocumentId, EntrepriseDocument, EntrepriseId } from 'camino-common/src/entreprise'
import { dateFormat } from 'camino-common/src/date'
import { DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import { AddEntrepriseDocumentPopup } from './add-entreprise-document-popup'
import { canEditEntreprise } from 'camino-common/src/permissions/entreprises'
import { User } from 'camino-common/src/roles'
import { RemoveEntrepriseDocumentPopup } from './remove-entreprise-document-popup'

interface Props {
  apiClient: Pick<EntrepriseApiClient, 'getEntrepriseDocuments' | 'creerEntrepriseDocument' | 'deleteEntrepriseDocument'>
  user: User
  entrepriseId: EntrepriseId
}
export const EntrepriseDocuments = caminoDefineComponent<Props>(['apiClient', 'entrepriseId', 'user'], props => {
  const data = ref<AsyncData<EntrepriseDocument[]>>({ status: 'LOADING' })

  const addPopup = ref<boolean>(false)
  const deletePopup = ref<boolean>(false)
  const deleteDocument = ref<{ nom: string; id: DocumentId } | null>(null)

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
    <div class="dsfr">
      <div class="fr-container">
        <div class=" fr-table">
          <table style={{ display: 'table' }}>
            <caption>Documents de l'entreprise</caption>
            <thead>
              <tr>
                <th scope="col">Nom</th>
                <th scope="col">Date</th>
                <th scope="col">Description</th>
                <th scope="col" style={{ display: 'flex', justifyContent: 'end' }}>
                  {canEditEntreprise(props.user, props.entrepriseId) ? (
                    <button
                      class={['fr-btn', 'fr-icon-add-line', 'fr-btn--primary', 'fr-mb-0']}
                      title={`Ajouter un document`}
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
                          <a href={getUiRestRoute(CaminoRestRoutes.downloadFichier, { documentId: item.id })} title={`Télécharger le document ${DocumentsTypes[item.type_id].nom}`} target="_blank">
                            {DocumentsTypes[item.type_id].nom}
                          </a>
                        </td>
                        <td>{dateFormat(item.date)}</td>
                        <td>{item.description}</td>
                        <td>
                          {item.can_delete_document ? (
                            <button
                              class={['fr-btn', 'fr-icon-delete-line', 'fr-btn--secondary', 'fr-mb-0']}
                              title={`Supprimer le document ${DocumentsTypes[item.type_id].nom}`}
                              onClick={() => {
                                deleteDocument.value = { nom: DocumentsTypes[item.type_id].nom, id: item.id }
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
            creerEntrepriseDocument: async (entrepriseId, entrepriseDocumentInput) => {
              const document = await props.apiClient.creerEntrepriseDocument(entrepriseId, entrepriseDocumentInput)
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
