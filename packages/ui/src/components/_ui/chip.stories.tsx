import { Chip } from './chip'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/Chip',
  component: Chip,
  argTypes: {},
}
export default meta

const onDelete = action('onDelete')
export const Default: Story = () => <Chip nom="Ma chip" onDeleteClicked={onDelete} />
export const WithColor: Story = () => <Chip nom="Ma chip" color="bg-success" onDeleteClicked={onDelete} />
