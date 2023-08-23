import { Meta, StoryFn } from '@storybook/vue3'
import { Dropdown } from './dropdown'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/Dropdown',
  // @ts-ignore il n'aime pas le côté générique du composant
  component: Dropdown,
}
export default meta

const onSelectAction = action('selectItem')
const items = [
  { id: 'id1', label: 'premier label' },
  { id: 'id2', label: 'second label' },
] as const

export const Default: StoryFn = () => <Dropdown id="select" label="label de cadix" items={items} selectedItemId={null} selectItem={onSelectAction} />
export const AlreadySelectedItem: StoryFn = () => <Dropdown id="select" label="label de cadix" items={items} selectedItemId={'id1'} selectItem={onSelectAction} />
