import { List } from './list'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/UI/List',
  component: List,
}
export default meta

export const Empty: StoryFn = () => <List />
export const WithElements: StoryFn = () => <List elements={['element', 'autre élément']} />
export const Mini: StoryFn = () => <List elements={['element', 'autre élément']} mini />
