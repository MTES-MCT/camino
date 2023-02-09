import { PureDemarcheRemovePopup, Props } from './demarche-remove-popup'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Titre/DemarcheRemovePopup',
  component: PureDemarcheRemovePopup
}
export default meta

const deleteAction = action('delete')
const close = action('close')

const reload = action('reload')
const displayMessage = action('displayMessage')

const apiClient: Props['apiClient'] = {
  deleteDemarche: demarcheId => {
    deleteAction(demarcheId)
    return new Promise(resolve => setTimeout(() => resolve(), 1000))
  }
}

export const Main: Story = () => (
  <PureDemarcheRemovePopup
    reload={reload}
    displayMessage={displayMessage}
    apiClient={apiClient}
    close={close}
    demarcheId={'demarcheId'}
    titreTypeId={'apc'}
    titreNom="Nom du titre"
    demarcheTypeId={'oct'}
  />
)
