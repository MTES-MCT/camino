import Date from './date.vue'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'UI/Date',
  component: Date,
  argTypes: {}
}
export default meta

type Props = {
  date: string
}

const Template: Story<Props> = (args: Props) => ({
  components: { Date },
  setup() {
    return { args }
  },
  template: `<Date v-bind="args" />`
})

export const Default = Template.bind({})
Default.args = {
  date: '2022-05-03'
}
export const UneDateEtrange = Template.bind({})
UneDateEtrange.args = {
  date: 'Une date'
}
