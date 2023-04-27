import { EditPopup } from './edit-popup'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Titre/EditPopup',
  component: EditPopup,
  argTypes: {},
}
export default meta

const editTitre = action('editTitre')
const close = action('close')

export const DefaultNoReference: StoryFn = () => (
  <EditPopup
    titre={{
      id: 'id',
      nom: 'Nom du titre',
      references: [],
    }}
    close={close}
    editTitre={(...params) => {
      editTitre(params)
      return Promise.resolve()
    }}
  />
)

export const OneReference: StoryFn = () => (
  <EditPopup
    titre={{
      id: 'id',
      nom: 'Nom du titre',
      references: [{ nom: 'RefValue', referenceTypeId: 'brg' }],
    }}
    close={close}
    editTitre={(...params) => {
      editTitre(params)
      return Promise.resolve()
    }}
  />
)
