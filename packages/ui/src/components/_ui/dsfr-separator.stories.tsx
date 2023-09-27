import { Meta, StoryFn } from '@storybook/vue3'
import { DsfrSeparator } from './dsfr-separator'

const meta: Meta = {
  title: 'Components/UI/Dsfr/Separator',
  component: DsfrSeparator,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

export const Default: StoryFn = () => <DsfrSeparator />
