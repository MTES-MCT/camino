import { Statut } from './statut'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Common/Statut',
  component: Statut,
  argTypes: {},
}
export default meta

export const Default: StoryFn = () => <Statut />
export const WithColor: StoryFn = () => <Statut nom="Mon statut" color="success" />
