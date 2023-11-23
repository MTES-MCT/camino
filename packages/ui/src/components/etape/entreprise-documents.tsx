import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { FunctionalComponent, onMounted, ref } from 'vue'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { AsyncData } from '@/api/client-rest'
import { EntrepriseApiClient } from '../entreprise/entreprise-api-client'
import { EtapeEntrepriseDocument } from 'camino-common/src/entreprise'
import { dateFormat } from 'camino-common/src/date'
import { User } from 'camino-common/src/roles'
import { EntrepriseDocumentLink } from '../entreprise/entreprise-documents'
import { getEntrepriseDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { EtapeId } from 'camino-common/src/etape'

interface Props {
  apiClient: Pick<EntrepriseApiClient, 'getEtapeEntrepriseDocuments'>
  user: User
  etapeId: EtapeId
  titreTypeId: TitreTypeId
  demarcheTypeId: DemarcheTypeId
  etapeTypeId: EtapeTypeId
  entrepriseDocuments: (etapeEntrepriseDocuments: EtapeEntrepriseDocument[]) => void
}

export const AsyncEntrepriseDocuments = caminoDefineComponent<Props>(['apiClient', 'etapeId', 'user', 'titreTypeId', 'demarcheTypeId', 'etapeTypeId', 'entrepriseDocuments'], props => {
  const data = ref<AsyncData<EtapeEntrepriseDocument[]>>({ status: 'LOADING' })

  onMounted(async () => {
    const entrepriseDocumentTypes = getEntrepriseDocuments(props.titreTypeId, props.demarcheTypeId, props.etapeTypeId)
    if (entrepriseDocumentTypes.length > 0) {
      data.value = { status: 'LOADING' }
      try {
        const entrepriseDocuments = await props.apiClient.getEtapeEntrepriseDocuments(props.etapeId)

        data.value = { status: 'LOADED', value: entrepriseDocuments }
        props.entrepriseDocuments(entrepriseDocuments)
      } catch (e: any) {
        data.value = {
          status: 'ERROR',
          message: e.message ?? 'something wrong happened',
        }
      }
    } else {
      data.value = { status: 'LOADED', value: [] }
    }
  })

  return () => <LoadingElement data={data.value} renderItem={items => <EntrepriseDocuments etapeEntrepriseDocuments={items} />} />
})

interface EntrepriseDocumentsProps {
  etapeEntrepriseDocuments: EtapeEntrepriseDocument[]
}
export const EntrepriseDocuments: FunctionalComponent<EntrepriseDocumentsProps> = props => {
  return (
    <>
      {' '}
      {props.etapeEntrepriseDocuments.length > 0 ? (
        <div class="dsfr">
            <div class=" fr-table">
              <table style={{ display: 'table' }}>
                <caption>Documents d'entreprise</caption>
                <thead>
                  <tr>
                    <th scope="col">Nom</th>
                    <th scope="col">Date</th>
                    <th scope="col">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {props.etapeEntrepriseDocuments.map(item => (
                    <tr>
                      <td>
                        <EntrepriseDocumentLink documentId={item.id} documentTypeId={item.entreprise_document_type_id} />
                      </td>
                      <td>{dateFormat(item.date)}</td>
                      <td>{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
      ) : null}
    </>
  )
}
