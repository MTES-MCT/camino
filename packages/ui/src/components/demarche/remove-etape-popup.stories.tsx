import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'
import { RemoveEtapePopup } from './remove-etape-popup'
import { etapeIdValidator } from 'camino-common/src/etape'

const meta: Meta = {
  title: 'Components/Demarche/RemoveEtapePopup',
  component: RemoveEtapePopup,
  argTypes: {},
}
export default meta

const deleteEtape = action('deleteEtape')
const close = action('close')

export const Default: StoryFn = () => (
  <RemoveEtapePopup
    demarcheTypeId="oct"
    etapeTypeId="mfr"
    titreTypeId="arm"
    id={etapeIdValidator.parse('etapeId')}
    apiClient={{
      deleteEtape(titreEtapeId) {
        deleteEtape(titreEtapeId)

        return Promise.resolve()
      },
    }}
    titreNom="Nouvelle espérance"
    close={close}
  />
)
