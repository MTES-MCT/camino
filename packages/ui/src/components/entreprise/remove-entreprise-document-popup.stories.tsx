import { Meta, StoryFn } from '@storybook/vue3'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { action } from '@storybook/addon-actions'
import { newEntrepriseId, toDocumentId } from 'camino-common/src/entreprise'
import { RemoveEntrepriseDocumentPopup } from './remove-entreprise-document-popup'
import { EntrepriseApiClient } from './entreprise-api-client'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Entreprise/Document/Suppression',
  component: RemoveEntrepriseDocumentPopup,
  argTypes: {},
}
export default meta

const close = action('close')
const deleteDoc = action('deleteDoc')

const apiClient: Pick<EntrepriseApiClient, 'deleteEntrepriseDocument'> = {
  deleteEntrepriseDocument: (entepriseId, documentId) => {
    deleteDoc(entepriseId, document)
    return Promise.resolve()
  },
}
export const Default: StoryFn = () => (
  <RemoveEntrepriseDocumentPopup
    close={close}
    entrepriseId={newEntrepriseId('entrepriseId')}
    entrepriseDocument={{ nom: 'Nom du document', id: toDocumentId(toCaminoDate('2023-05-15'), 'kbi', '12345678') }}
    apiClient={apiClient}
  />
)
