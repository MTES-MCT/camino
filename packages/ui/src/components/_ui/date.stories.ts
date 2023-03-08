import { Date, Props } from './date'
import { Meta, Story } from '@storybook/vue3'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/UI/Date',
  component: Date,
  argTypes: {},
}
export default meta

const Template: Story<Props> = (args: Props) => ({
  components: { Date },
  setup() {
    return { args }
  },
  template: `<Date v-bind="args" />`,
})

export const Default = Template.bind(
  {},
  {
    date: toCaminoDate('2022-05-03'),
  }
)
export const UneDateEtrange = Template.bind(
  {},
  {
    date: 'Une date' as CaminoDate,
  }
)
