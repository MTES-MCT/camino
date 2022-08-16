import SubstancesEdit from './substances-edit.vue'
import { Meta, Story } from '@storybook/vue3'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'
import { DomaineId } from 'camino-common/src/static/domaines'
import { HeritageProp } from '@/components/etape/heritage-edit.types'

const meta: Meta = {
  title: 'Components/Etape/SubstancesEdit',
  component: SubstancesEdit,
  argTypes: {}
}
export default meta

type Props = {
  substances: { substanceId: SubstanceLegaleId | undefined; ordre: number }[]
  heritageProps: { substances: HeritageProp }
  incertitudes: { substances: boolean }
  domaineId: DomaineId
}

const Template: Story<Props> = (args: Props) => ({
  components: { SubstancesEdit },
  setup() {
    return { args }
  },
  template: `<SubstancesEdit  v-bind="args"/>`
})

export const SansHeritage = Template.bind({})
SansHeritage.args = {
  domaineId: 'm',
  heritageProps: {
    substances: {
      actif: false,
      etape: {
        date: '2020-01-01',
        type: { nom: 'Demande' },
        substances: [{ substanceId: 'auru', ordre: 0 }],
        incertitudes: { substances: true },
        contenu: {}
      }
    }
  },
  incertitudes: { substances: true },
  substances: [{ substanceId: 'auru', ordre: 0 }]
}

export const AvecHeritage = Template.bind({})
AvecHeritage.args = {
  domaineId: 'm',
  heritageProps: {
    substances: {
      actif: true,
      etape: {
        date: '2020-01-01',
        type: { nom: 'Demande' },
        substances: [{ substanceId: 'auru', ordre: 0 }],
        incertitudes: { substances: true },
        contenu: {}
      }
    }
  },
  incertitudes: { substances: true },
  substances: [{ substanceId: 'auru', ordre: 0 }]
}
