import { InputDate } from './dsfr-input-date'
import { Meta, StoryFn } from '@storybook/vue3'
import { toCaminoDate } from 'camino-common/src/date'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/InputDate(DSFR)',
  component: InputDate,
}
export default meta
const dateChanged = action('dateChanged')

export const Empty: StoryFn = () => <InputDate id="id-1" dateChanged={dateChanged} legend={{ main: 'Date de naissance', description: 'Une belle description' }} />
export const WithDateAlreadySet: StoryFn = () => <InputDate id="id-2" legend={{ main: 'Date de permis de conduire' }} initialValue={toCaminoDate('2023-01-26')} dateChanged={dateChanged} />
