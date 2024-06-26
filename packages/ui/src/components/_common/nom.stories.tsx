import { Meta, StoryFn } from '@storybook/vue3'
import { Nom } from './nom'

const meta: Meta = {
  title: 'Components/Common/Nom',
  component: Nom,
}
export default meta

export const Default: StoryFn = () => <Nom />
export const Lowercase: StoryFn = () => <Nom nom="nom minuscule" />
export const AlreadyUppercase: StoryFn = () => <Nom nom="Nom minuscule" />
