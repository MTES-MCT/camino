import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue3'
import { RemovePopup } from './remove-popup'

const meta: Meta = {
  title: 'Components/Utilisateur/RemovePopup',
  component: RemovePopup,
  argTypes: {}
}
export default meta

const deleteUser = action('deleteUser')
const close = action('close')

export const Default: Story = () => (<RemovePopup utilisateur={{nom: 'Nom', prenom: 'Prénom'}} deleteUser={() => {
  deleteUser()
  return Promise.resolve()
}} 
close={close}
/>)
