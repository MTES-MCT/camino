import { About } from './about'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'Pages/APropos',
  component: About,
}
export default meta

export const Default: Story = () => <About />
