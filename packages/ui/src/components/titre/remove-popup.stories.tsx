import { RemovePopup } from './remove-popup'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Titre/RemovePopup',
  component: RemovePopup,
  argTypes: {},
}
export default meta

const deleteTitre = action('deleteTitre')
const close = action('close')

export const Default: StoryFn = () => (
  <RemovePopup
    titreId="idTitre"
    close={close}
    deleteTitre={() => {
      deleteTitre()
      return Promise.resolve()
    }}
    titreNom="Nom du titre"
    titreTypeId="arm"
  />
)
