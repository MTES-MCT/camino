import { DsfrTag } from './tag'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Deprecated/Components/UI/Tag',
  component: DsfrTag,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

export const Normal: StoryFn = () => <DsfrTag ariaLabel="Tag" />
export const Mini: StoryFn = () => <DsfrTag ariaLabel="Tag" tagSize="sm" />
export const Erreur: StoryFn = () => <DsfrTag ariaLabel="Tag" color="bg-error" />
