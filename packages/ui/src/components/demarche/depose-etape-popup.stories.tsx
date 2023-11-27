import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'
import { DeposeEtapePopup } from './depose-etape-popup'
import { etapeIdValidator } from 'camino-common/src/etape'

const meta: Meta = {
  title: 'Components/Demarche/DeposeEtapePopup',
  component: DeposeEtapePopup,
  argTypes: {},
}
export default meta

const deposeEtape = action('deposeEtape')
const close = action('close')

export const Default: StoryFn = () => (
  <DeposeEtapePopup
    demarcheTypeId="oct"
    etapeTypeId="mfr"
    titreTypeId="arm"
    id={etapeIdValidator.parse('etapeId')}
    apiClient={{
      deposeEtape(titreEtapeId) {
        deposeEtape(titreEtapeId)

        return Promise.resolve()
      },
    }}
    titreNom="Nouvelle espérance"
    close={close}
  />
)
