import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'
import { DeposeEtapePopup } from './depose-etape-popup'
import { etapeIdValidator } from 'camino-common/src/etape'

const meta: Meta = {
  title: 'Components/Demarche/DeposeEtapePopup',
  component: DeposeEtapePopup,
}
export default meta

const deposeEtape = action('deposeEtape')
const close = action('close')

export const Depot: StoryFn = () => (
  <DeposeEtapePopup
    id={etapeIdValidator.parse('etapeId')}
    apiClient={{
      deposeEtape(titreEtapeId) {
        deposeEtape(titreEtapeId)

        return Promise.resolve()
      },
    }}
    close={close}
    etapeTypeId="mfr"
  />
)

export const Finalisation: StoryFn = () => (
  <DeposeEtapePopup
    id={etapeIdValidator.parse('etapeId')}
    apiClient={{
      deposeEtape(titreEtapeId) {
        deposeEtape(titreEtapeId)

        return Promise.resolve()
      },
    }}
    close={close}
    etapeTypeId="asc"
  />
)
