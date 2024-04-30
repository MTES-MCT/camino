import { Administrations } from './administrations'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Administrations',
  component: Administrations,
}
export default meta

export const Default: StoryFn = () => <Administrations />
