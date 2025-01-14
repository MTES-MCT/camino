import { Meta, StoryFn } from '@storybook/vue3'
import { Badges } from './badges'

const meta: Meta = {
  title: 'Components/UI/Badges',
  component: Badges,
}
export default meta

export const Default: StoryFn = () => <Badges elements={['Un badge', 'Un autre badge']} />
export const Empty: StoryFn = () => <Badges elements={[]} />
