import { PureDemarcheEditPopup, Props } from './demarche-edit-popup'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { demarcheIdValidator } from 'camino-common/src/demarche'

const meta: Meta = {
  title: 'Components/Titre/DemarcheEditPopup',
  component: PureDemarcheEditPopup,
}
export default meta

const create = action('create')
const update = action('update')
const close = action('close')

const reload = action('reload')
const displayMessage = action('displayMessage')

const apiClient: Props['apiClient'] = {
  createDemarche: demarche => {
    create(demarche)
    return new Promise(resolve => setTimeout(() => resolve(), 1000))
  },
  updateDemarche: demarche => {
    update(demarche)
    return new Promise(resolve => setTimeout(() => resolve(), 1000))
  },
}

export const Create: Story = () => (
  <PureDemarcheEditPopup
    reload={reload}
    displayMessage={displayMessage}
    apiClient={apiClient}
    close={close}
    demarche={{ titreId: 'titreId' }}
    titreTypeId={'apc'}
    titreNom="Nom du titre"
    tabId="demarches"
  />
)
export const Edit: Story = () => (
  <PureDemarcheEditPopup
    reload={reload}
    displayMessage={displayMessage}
    apiClient={apiClient}
    close={close}
    demarche={{
      titreId: 'titreId',
      id: demarcheIdValidator.parse('demarcheId'),
      typeId: 'amo',
      description: 'description',
    }}
    titreTypeId={'apc'}
    titreNom="Nom du titre"
    tabId="demarches"
  />
)
