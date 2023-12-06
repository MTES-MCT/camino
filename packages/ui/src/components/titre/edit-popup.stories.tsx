import { EditPopup } from './edit-popup'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { titreIdValidator } from 'camino-common/src/titres'

const meta: Meta = {
  title: 'Components/Titre/EditPopup',
  component: EditPopup,
  argTypes: {},
}
export default meta

const editTitreAction = action('editTitre')
const close = action('close')
const reloadAction = action('reload')
const reload = () => {
  reloadAction('close')

  return Promise.resolve()
}

export const DefaultNoReference: StoryFn = () => (
  <EditPopup
    reload={reload}
    titre={{
      id: titreIdValidator.parse('id'),
      nom: 'Nom du titre',
      references: [],
    }}
    close={close}
    apiClient={{
      editTitre: (...params) => {
        editTitreAction(params)

        return Promise.resolve()
      },
    }}
  />
)

export const OneReference: StoryFn = () => (
  <EditPopup
    reload={reload}
    titre={{
      id: titreIdValidator.parse('id'),
      nom: 'Nom du titre',
      references: [{ nom: 'Valeur', referenceTypeId: 'brg' }],
    }}
    close={close}
    apiClient={{
      editTitre: (...params) => {
        editTitreAction(params)

        return Promise.resolve()
      },
    }}
  />
)
