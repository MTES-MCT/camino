import { Meta, StoryFn } from '@storybook/vue3'
import { PointReference } from './point-reference'

const meta: Meta = {
  title: 'Components/Common/PointReference',
  component: PointReference,
}
export default meta

export const Default: StoryFn = () => <PointReference />
export const WithPoint: StoryFn = () => <PointReference references={{ x: '1', y: '2' }} />
