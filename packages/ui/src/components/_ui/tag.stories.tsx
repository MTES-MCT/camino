import { DsfrTag } from './tag'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/Tag',
  component: DsfrTag,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const clickAction = action('clicked')
export const Normal: StoryFn = () => <DsfrTag ariaLabel="Tag" />
export const Mini: StoryFn = () => <DsfrTag ariaLabel="Tag" tagSize="sm" />
export const Link: StoryFn = () => <DsfrTag ariaLabel="Tag" to={{ name: 'dashboard' }} />
export const Clickable: StoryFn = () => <DsfrTag ariaLabel="Tag" onClicked={clickAction} />
