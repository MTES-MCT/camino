import { Date } from './date'
import { Meta, StoryFn } from '@storybook/vue3'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/UI/Date',
  component: Date,
  argTypes: {},
}
export default meta

export const Default: StoryFn = () => <Date date={toCaminoDate('2022-05-03')} />
export const UneDateEtrange: StoryFn = () => <Date date={'Une date' as CaminoDate} />
