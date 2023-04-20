import { Meta, Story } from '@storybook/vue3'
import { PointReference } from './point-reference'

const meta: Meta = {
  title: 'Components/common/PointReference',
  component: PointReference,
}
export default meta

export const Default: Story = () => <PointReference />
export const WithPoint: Story = () => <PointReference references={{ x: '1', y: '2' }} />
