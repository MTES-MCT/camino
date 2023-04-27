import { Pill } from './pill'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Ui/Pill',
  component: Pill,
  argTypes: {
    color: String,
  },
}
export default meta

export const Primary: StoryFn = () => <Pill text="Hello" />
export const Error: StoryFn = () => <Pill color="bg-error" text="hello" />
