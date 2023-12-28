import { Meta, StoryFn } from '@storybook/vue3'
import { TravauxIcone } from './travaux-icone'

const meta: Meta = {
  title: 'Components/Titre/TravauxIcone',
  component: TravauxIcone,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

export const Selected: StoryFn = () => <TravauxIcone selected={true} />

export const NotSelected: StoryFn = () => <TravauxIcone selected={false} />
