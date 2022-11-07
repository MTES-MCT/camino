import TitreTypeSelect from './titre-type-select.vue'
import { Meta, Story } from '@storybook/vue3'
import { DomaineId } from 'camino-common/src/static/domaines'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { User } from 'camino-common/src/roles'

const meta: Meta = {
  title: 'Components/common/TitreTypeSelect',
  component: TitreTypeSelect,
  argTypes: {}
}
export default meta

type Props = {
  element: {
    domaineId: DomaineId | undefined
    titreTypeId: TitreTypeId | undefined | null
  }
  user: User
}

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
