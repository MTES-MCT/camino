import { TitreTypeSelect, Props } from './titre-type-select'
import { Meta, StoryFn } from '@storybook/vue3'
import { testBlankUser } from 'camino-common/src/tests-utils'

const meta: Meta = {
  title: 'Components/common/TitreTypeSelect',
  component: TitreTypeSelect,
  argTypes: {},
}
export default meta

const Template: StoryFn<Props> = (args: Props) => ({
  components: { TitreTypeSelect },
  data: () => ({
    element: {
      domaineId: undefined,
      titreTypeId: undefined,
    },
  }),
  setup() {
    return { args }
  },
  template: '<TitreTypeSelect  v-bind="args" :element="element" />',
})

export const Default = Template.bind({})
Default.args = {
  user: { role: 'super', ...testBlankUser },
}

export const Entreprise = Template.bind({})
Entreprise.args = {
  user: { role: 'entreprise', entreprises: [], ...testBlankUser },
}
