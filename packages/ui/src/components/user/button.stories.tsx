import { PureButton } from './button'
import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/User/Button',
  component: PureButton,
  argTypes: {
    user: Object,
    menuActive: Boolean,
  },
}
export default meta

const onConnectionClicked = action('onConnectionClicked')
const onUserClicked = action('onUserClicked')

export const NotConnected: StoryFn = () => <PureButton menuActive={false} onConnectionClicked={onConnectionClicked} onUserClicked={onUserClicked} />

export const Connected: StoryFn = () => (
  <PureButton
    user={{
      nom: 'Nom',
      prenom: 'prenom',
    }}
    menuActive={false}
    onConnectionClicked={onConnectionClicked}
    onUserClicked={onUserClicked}
  />
)
