import SubstancesEdit from './substances-edit.vue'
import { Meta, Story } from '@storybook/vue3'
import { toCaminoDate } from 'camino-common/src/date'
import {
  EtapeWithIncertitudesAndHeritage,
  EtapeFondamentale
} from 'camino-common/src/etape'
import { DomaineId } from 'camino-common/src/static/domaines'
import {
  SubstanceLegaleId,
  SubstancesLegale
} from 'camino-common/src/static/substancesLegales'

type Props = {
  substances: (SubstanceLegaleId | undefined)[]
  heritageProps: EtapeWithIncertitudesAndHeritage<
    Pick<EtapeFondamentale, 'substances' | 'type' | 'date'>
  >['heritageProps']
  incertitudes: { substances: boolean }
  domaineId: DomaineId
}

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
    substances: [SubstancesLegale.auru.id],
    date: toCaminoDate('2020-01-01'),
    type: { nom: 'Demande', id: 'aac' }
  }
}
export const SansHeritage = Template.bind({})
SansHeritage.args = {
  domaineId: 'm',
  heritageProps: { substances: { ...heritageProps, actif: false } },
  incertitudes: { substances: false }
}

export const AvecHeritage = Template.bind({})
AvecHeritage.args = {
  domaineId: 'm',
  heritageProps: { substances: { ...heritageProps } },
  incertitudes: { substances: true }
}
