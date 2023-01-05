import { Pill, Props } from './pill'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Ui/Pill',
  component: Pill,
  argTypes: {
    color: String
  }
}
export default meta

const Template: Story<Props> = (args: Props) => ({
  components: { Pill },
  setup() {
    return { args }
  },
  template: '<Pill v-bind="args">Hello</Pill>'
})

export const Primary = Template.bind({})

export const Error = Template.bind(
  {},
  {
    color: 'bg-error'
  }
)
