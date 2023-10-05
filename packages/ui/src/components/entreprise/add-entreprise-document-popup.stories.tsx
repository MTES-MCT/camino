import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { newEntrepriseId, toEntrepriseDocumentId } from 'camino-common/src/entreprise'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { AddEntrepriseDocumentPopup } from './add-entreprise-document-popup'
import { ApiClient } from '@/api/api-client'

const meta: Meta = {
  title: 'Components/Entreprise/Document/Ajout',
  component: AddEntrepriseDocumentPopup,
  argTypes: {},
}
export default meta

const close = action('close')
const save = action('save')
const uploadTempDocumentAction = action('uploadTempDocumentAction')

const apiClient: Pick<ApiClient, 'creerEntrepriseDocument' | 'uploadTempDocument'> = {
  creerEntrepriseDocument: (entepriseId, document) => {
    save(entepriseId, document)

    return Promise.resolve(toEntrepriseDocumentId(document.date, document.typeId, '12345678'))
  },
  uploadTempDocument: document => {
    uploadTempDocumentAction(document)

    return Promise.resolve(tempDocumentNameValidator.parse(new Date().toISOString()))
  },
}
export const Default: StoryFn = () => <AddEntrepriseDocumentPopup close={close} entrepriseId={newEntrepriseId('entrepriseId')} apiClient={apiClient} />
export const TypeDeDocumentVerouille: StoryFn = () => (
  <AddEntrepriseDocumentPopup close={close} entrepriseId={newEntrepriseId('entrepriseId')} apiClient={apiClient} lockedEntrepriseDocumentTypeId="kbi" />
)
