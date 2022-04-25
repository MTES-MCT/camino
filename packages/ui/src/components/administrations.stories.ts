import Administrations from './administrations.vue'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'Page/Administrations',
  component: Administrations,
  argTypes: {}
}
export default meta

type Props = {}

const Template: Story<Props> = (args: Props) => ({
  components: { Administrations },
  setup() {
    return { args }
  },
  template: '<Administrations v-bind="args" />'
})

export const Default = Template.bind({})
Default.args = {}
