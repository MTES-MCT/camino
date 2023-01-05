import { Meta, Story } from '@storybook/vue3'
import { HelpTooltip, Props } from './help-tooltip'

const meta: Meta<Props> = {
  title: 'Components/Ui/HelpTooltip',
  component: HelpTooltip
}
export default meta

const Template: Story<Props> = (args: Props) => ({
  components: { HelpTooltip },
  setup() {
    return { args }
  },
  template: '<HelpTooltip v-bind="args"/>'
})

export const Simple = Template.bind({}, { text: 'Tooltip text' })
export const WithDifferentIcon = Template.bind(
  {},
  { icon: 'download', text: 'Tooltip text' }
)
