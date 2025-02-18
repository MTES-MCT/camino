import { FunctionalPopup } from './functional-popup'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { sleep } from 'camino-common/src/typescript-tools'
import { Alert } from './alert'

const meta: Meta = {
  title: 'Components/UI/Popup',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: FunctionalPopup,
}
export default meta

const doStuff = action('doStuff')
const close = action('close')

export const Main: StoryFn = () => (
  <FunctionalPopup
    id="mainId"
    close={close}
    title="Titre de la popup"
    canValidate={true}
    validate={{
      action: () => {
        doStuff()

        return sleep(5000)
      },
    }}
    content={() => <Alert small={true} title="Attention : cette opération est définitive et ne peut pas être annulée" type="warning" />}
  />
)

export const SaveError: StoryFn = () => (
  <FunctionalPopup
    id="mainId"
    close={close}
    title="Titre de la popup"
    canValidate={true}
    validate={{
      action: () => {
        doStuff()

        return Promise.reject(new Error('erreur'))
      },
    }}
    content={() => <Alert small={true} title="Attention : cette opération est définitive et ne peut pas être annulée" type="warning" />}
  />
)

export const NotValid: StoryFn = () => (
  <FunctionalPopup
    id="mainId"
    close={close}
    title="Titre de la popup"
    canValidate={false}
    validate={{
      action: () => {
        doStuff()

        return Promise.resolve()
      },
    }}
    content={() => <Alert small={true} title="Attention : cette opération est définitive et ne peut pas être annulée" type="warning" />}
  />
)
