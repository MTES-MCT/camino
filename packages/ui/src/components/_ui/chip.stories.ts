import { Chip, Props } from './chip'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'UI/Chip',
  component: Chip,
  argTypes: {}
}
export default meta

const Template: Story<Props> = (args: Props) => ({
  components: { Chip },
  setup() {
    return { args }
  },
  template: `<Chip v-bind="args" @onDelete='onDelete' />`,
  methods: {
    onDelete: action('onDelete')
  }
})

export const Default = Template.bind({})
Default.args = {
  nom: 'Ma chip'
}
export const WithColor = Template.bind({})
WithColor.args = {
  nom: 'Ma chip',
  color: 'bg-success'
}
