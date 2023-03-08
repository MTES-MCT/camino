import { FunctionalPopup } from './functional-popup'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/Popup',
  component: FunctionalPopup,
}
export default meta

const doStuff = action('doStuff')
const close = action('close')

export const Main: StoryFn = () => (
  <FunctionalPopup
    close={close}
    title="Titre de la popup"
    validate={{
      can: true,
      action: () => {
        doStuff()
        return Promise.resolve()
      },
    }}
    content={() => (
      <div>
        <input type="text" class="tablet-blob-2-3 p-s" />
        <div class="bg-warning color-bg p-s mb-l">
          <span class="bold"> Attention </span>: cette opération est définitive et ne peut pas être annulée.
        </div>
      </div>
    )}
  />
)

export const NotValid: StoryFn = () => (
  <FunctionalPopup
    close={close}
    title="Titre de la popup"
    validate={{
      can: false,
      action: () => {
        doStuff()
        return Promise.resolve()
      },
    }}
    content={() => (
      <div>
        <input type="text" class="tablet-blob-2-3 p-s" />
        <div class="bg-warning color-bg p-s mb-l">
          <span class="bold"> Attention </span>: cette opération est définitive et ne peut pas être annulée.
        </div>
      </div>
    )}
  />
)
