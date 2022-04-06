import Statut from './statut.vue'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/common/Statut',
  component: Statut,
  argTypes: {}
}
export default meta

type Props = {
  nom?: string
  color?: string
}

const Template: Story<Props> = (args: Props) => ({
  components: { Statut },
  setup() {
    return { args }
  },
  template: `<Statut v-bind="args" @onDelete='onDelete' />`,
  methods: {
    onDelete: action('onDelete')
  }
})

export const Default = Template.bind({})
Default.args = {}
export const WithColor = Template.bind({})
WithColor.args = {
  nom: 'Mon statut',
  color: 'success'
}
