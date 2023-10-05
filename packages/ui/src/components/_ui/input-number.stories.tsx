import { InputNumber } from './input-number'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/InputNumber',
  component: InputNumber,
}
export default meta
const numberChanged = action('numberChanged')

export const Empty: StoryFn = () => <InputNumber numberChanged={numberChanged} />
export const WithPlaceholder: StoryFn = () => <InputNumber numberChanged={numberChanged} placeholder="Un Placeholder" />
export const Negative: StoryFn = () => <InputNumber negative={true} numberChanged={numberChanged} />
export const Integer: StoryFn = () => <InputNumber integer={true} numberChanged={numberChanged} />
export const WithDefaultValue: StoryFn = () => <InputNumber integer={true} numberChanged={numberChanged} initialValue={12} />
