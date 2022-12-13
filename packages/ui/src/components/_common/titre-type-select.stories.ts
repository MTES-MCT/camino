import { TitreTypeSelect, Props } from './titre-type-select'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/common/TitreTypeSelect',
  component: TitreTypeSelect,
  argTypes: {}
}
export default meta

const Template: Story<Props> = (args: Props) => ({
  components: { TitreTypeSelect },
  data: () => ({
    element: {
      domaineId: undefined,
      titreTypeId: undefined
    }
  }),
  setup() {
    return { args }
  },
  template: '<TitreTypeSelect  v-bind="args" :element="element" />'
})

export const Default = Template.bind({})
Default.args = {
  user: { role: 'super', administrationId: null }
}

export const Entreprise = Template.bind({})
Entreprise.args = {
  user: { role: 'entreprise', administrationId: null }
}
