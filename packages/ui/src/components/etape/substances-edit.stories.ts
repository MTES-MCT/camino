import { SubstancesEdit, Props } from './substances-edit'
import { Meta, StoryFn } from '@storybook/vue3'
import { toCaminoDate } from 'camino-common/src/date'
import { SubstancesLegale } from 'camino-common/src/static/substancesLegales'

const meta: Meta = {
  title: 'Components/Etape/SubstancesEdit',
  component: SubstancesEdit,
  argTypes: {},
}
export default meta

const Template: StoryFn<Props> = (args: Props) => ({
  components: { SubstancesEdit },
  setup() {
    return { args }
  },
  data: () => ({
    substances: ['auru'],
  }),
  template: `<SubstancesEdit  v-bind="args" :substances='substances'/>`,
})
const heritageProps: Props['heritageProps']['substances'] = {
  actif: true,
  etape: {
    incertitudes: { substances: true },
    substances: [SubstancesLegale.auru.id],
    date: toCaminoDate('2020-01-01'),
    type: { nom: 'Demande', id: 'aac' },
  },
}
export const SansHeritage = Template.bind({})
SansHeritage.args = {
  domaineId: 'm',
  heritageProps: { substances: { ...heritageProps, actif: false } },
  incertitudes: { substances: false },
}

export const AvecHeritage = Template.bind({})
AvecHeritage.args = {
  domaineId: 'm',
  heritageProps: { substances: { ...heritageProps } },
  incertitudes: { substances: true },
}
