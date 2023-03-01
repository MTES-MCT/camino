import { Administrations } from './administrations'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Administrations',
  component: Administrations,
  argTypes: {}
}
export default meta

export const Default: Story = () => <Administrations />
