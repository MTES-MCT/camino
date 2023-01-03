import { Tag, Props } from './tag'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'UI/Tag',
  component: Tag
}
export default meta

export const Normal: StoryFn = args => <Tag>Tag</Tag>
export const Mini: StoryFn = args => <Tag mini={true}>Tag</Tag>
export const Erreur: StoryFn = args => <Tag color="bg-error">Tag</Tag>
