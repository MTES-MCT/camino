import { Date } from './date'
import { Meta, Story } from '@storybook/vue3'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/UI/Date',
  component: Date,
  argTypes: {},
}
export default meta

export const Default: Story = () => <Date date={toCaminoDate('2022-05-03')} />
export const UneDateEtrange: Story = () => <Date date={'Une date' as CaminoDate} />
