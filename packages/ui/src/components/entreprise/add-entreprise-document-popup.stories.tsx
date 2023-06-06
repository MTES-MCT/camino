import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { newEntrepriseId, toDocumentId } from 'camino-common/src/entreprise'
import { AddEntrepriseDocumentPopup } from './add-entreprise-document-popup'
import { EntrepriseApiClient } from './entreprise-api-client'

const meta: Meta = {
  title: 'Components/Entreprise/Document/Ajout',
  component: AddEntrepriseDocumentPopup,
  argTypes: {},
}
export default meta

const close = action('close')
const save = action('save')

const apiClient: Pick<EntrepriseApiClient, 'creerEntrepriseDocument'> = {
  creerEntrepriseDocument: (entepriseId, document) => {
    save(entepriseId, document)
    return Promise.resolve(toDocumentId(document.date, document.typeId, '12345678'))
  },
}
export const Default: StoryFn = () => <AddEntrepriseDocumentPopup close={close} entrepriseId={newEntrepriseId('entrepriseId')} apiClient={apiClient} />
export const TypeDeDocumentVerouille: StoryFn = () => (
  <AddEntrepriseDocumentPopup close={close} entrepriseId={newEntrepriseId('entrepriseId')} apiClient={apiClient} lockedEntrepriseDocumentTypeId="kbi" />
)
