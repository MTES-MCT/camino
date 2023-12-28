import { DemarcheEditPopup, Props } from './demarche-edit-popup'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { demarcheIdValidator, demarcheSlugValidator } from 'camino-common/src/demarche'
import { titreIdValidator } from 'camino-common/src/titres'

const meta: Meta = {
  title: 'Components/Titre/DemarcheEditPopup',
  component: DemarcheEditPopup,
}
export default meta

const create = action('create')
const update = action('update')
const close = action('close')

const reload = action('reload')

const apiClient: Props['apiClient'] = {
  createDemarche: demarche => {
    create(demarche)

    return new Promise(resolve => setTimeout(() => resolve(demarcheSlugValidator.parse('newDemarcheSlug')), 1000))
  },
  updateDemarche: demarche => {
    update(demarche)

    return new Promise(resolve => setTimeout(() => resolve(demarcheSlugValidator.parse('editDemarcheSlug')), 1000))
  },
}

export const Create: StoryFn = () => (
  <DemarcheEditPopup reload={reload} apiClient={apiClient} close={close} demarche={{ titreId: titreIdValidator.parse('titreId') }} titreTypeId={'apc'} titreNom="Nom du titre" tabId="demarches" />
)
export const Edit: StoryFn = () => (
  <DemarcheEditPopup
    reload={reload}
    apiClient={apiClient}
    close={close}
    demarche={{
      titreId: titreIdValidator.parse('titreId'),
      id: demarcheIdValidator.parse('demarcheId'),
      typeId: 'amo',
      description: 'description',
    }}
    titreTypeId={'apc'}
    titreNom="Nom du titre"
    tabId="demarches"
  />
)
