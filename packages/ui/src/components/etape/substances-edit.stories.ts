import SubstancesEdit, { Props } from './substances-edit.vue'
import { Meta, Story } from '@storybook/vue3'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Etape/SubstancesEdit',
  component: SubstancesEdit,
  argTypes: {}
}
export default meta

const Template: Story<Props> = (args: Props) => ({
  components: { SubstancesEdit },
  setup() {
    return { args }
  },
  data: () => ({
    substances: ['auru']
  }),
  template: `<SubstancesEdit  v-bind="args" :substances='substances'/>`
})
const heritageProps: Props['heritageProps']['substances'] = {
  actif: true,
  etape: {
    incertitudes: { substances: true },
    substances: [],
    date: toCaminoDate('2022-02-02'),
    type: { nom: 'bite', id: 'aac' }
  }
}
export const SansHeritage = Template.bind({})
SansHeritage.args = {
  domaineId: 'm',
  heritageProps: { substances: { ...heritageProps, actif: false } },
  incertitudes: { substances: true }
}

export const AvecHeritage = Template.bind({})
AvecHeritage.args = {
  domaineId: 'm',
  heritageProps: { substances: heritageProps },
  incertitudes: { substances: true }
}
