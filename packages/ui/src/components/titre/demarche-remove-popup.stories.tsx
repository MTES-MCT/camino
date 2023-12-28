import { DemarcheRemovePopup, Props } from './demarche-remove-popup'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { demarcheIdValidator } from 'camino-common/src/demarche'

const meta: Meta = {
  title: 'Components/Titre/DemarcheRemovePopup',
  component: DemarcheRemovePopup,
}
export default meta

const deleteAction = action('delete')
const close = action('close')

const reload = () => {
  action('reload')

  return Promise.resolve()
}

const apiClient: Props['apiClient'] = {
  deleteDemarche: demarcheId => {
    deleteAction(demarcheId)

    return new Promise(resolve => setTimeout(() => resolve(), 1000))
  },
}

export const Main: StoryFn = () => (
  <DemarcheRemovePopup reload={reload} apiClient={apiClient} close={close} demarcheId={demarcheIdValidator.parse('demarcheId')} titreTypeId={'apc'} titreNom="Nom du titre" demarcheTypeId={'oct'} />
)
