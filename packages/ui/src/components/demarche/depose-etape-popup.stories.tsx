import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'
import { DeposeEtapePopup } from './depose-etape-popup'

const meta: Meta = {
  title: 'Components/Demarche/DeposeEtapePopup',
  component: DeposeEtapePopup,
}
export default meta

const deposeEtape = action('deposeEtape')
const close = action('close')

export const Depot: StoryFn = () => (
  <DeposeEtapePopup
    deposeEtape={async () => {
      deposeEtape()
      return Promise.resolve()
    }}
    close={close}
    etapeTypeId="mfr"
  />
)

export const Finalisation: StoryFn = () => (
  <DeposeEtapePopup
    deposeEtape={async () => {
      deposeEtape()
      return Promise.resolve()
    }}
    close={close}
    etapeTypeId="asc"
  />
)
