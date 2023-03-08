import { Tag, Props } from './tag'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/UI/Tag',
  component: Tag,
}
export default meta

export const Normal: StoryFn = args => <Tag text="Tag" />
export const Mini: StoryFn = args => <Tag text="Tag" mini={true} />
export const Erreur: StoryFn = args => <Tag text="Tag" color="bg-error" />
