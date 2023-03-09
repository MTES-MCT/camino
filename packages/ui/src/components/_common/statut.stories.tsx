import { Statut } from './statut'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/common/Statut',
  component: Statut,
  argTypes: {},
}
export default meta

export const Default: Story = () => <Statut />
export const WithColor: Story = () => <Statut nom="Mon statut" color="success" />
