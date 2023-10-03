import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'
import { RemovePopup } from './remove-popup'

const meta: Meta = {
  title: 'Components/Utilisateur/RemovePopup',
  component: RemovePopup,
  argTypes: {},
}
export default meta

const deleteUser = action('deleteUser')
const close = action('close')

export const Default: StoryFn = () => (
  <RemovePopup
    utilisateur={{ nom: 'Nom', prenom: 'Prénom' }}
    deleteUser={() => {
      deleteUser()

      return Promise.resolve()
    }}
    close={close}
  />
)
