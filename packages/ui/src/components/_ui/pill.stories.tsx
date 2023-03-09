import { Pill } from './pill'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Ui/Pill',
  component: Pill,
  argTypes: {
    color: String,
  },
}
export default meta

export const Primary: Story = () => <Pill>Hello</Pill>
export const Error: Story = () => <Pill color="bg-error">Hello</Pill>
