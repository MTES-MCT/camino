import { InputDate } from './input-date'
import { Meta, StoryFn } from '@storybook/vue3'
import { toCaminoDate } from 'camino-common/src/date'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/InputDate',
  component: InputDate
}
export default meta
const dateChanged = action('dateChanged')

export const Empty: StoryFn = () => <InputDate dateChanged={dateChanged} />
export const WithDateAlreadySet: StoryFn = () => (
  <InputDate
    initialValue={toCaminoDate('2023-01-26')}
    dateChanged={dateChanged}
  />
)
