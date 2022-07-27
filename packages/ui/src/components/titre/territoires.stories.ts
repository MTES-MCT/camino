import Territoires from './territoires.vue'
import { TerritoiresProps } from './territoires.type'
import { Meta, Story } from '@storybook/vue3'
import {
  DEPARTEMENT_IDS,
  Departements
} from 'camino-common/src/static/departement'

const meta: Meta = {
  title: 'Components/Titre/Territoires',
  component: Territoires,
  argTypes: {}
}
export default meta

const Template: Story<TerritoiresProps> = (args: TerritoiresProps) => ({
  components: { Territoires },
  setup() {
    return { args }
  },
  template: '<Territoires v-bind="args" />'
})

export const OnlySurface = Template.bind({})
OnlySurface.args = {
  surface: 4
}

export const OnlyForets = Template.bind({})
OnlyForets.args = {
  forets: [{ nom: 'Forêt 1' }, { nom: 'Forêt 2' }]
}

export const OnlySdomZones = Template.bind({})
OnlySdomZones.args = {
  sdomZones: [{ nom: 'Zone 1' }, { nom: 'Zone 3' }]
}

export const All = Template.bind({})
All.args = {
  surface: 4,
  forets: [{ nom: 'Forêt 1' }, { nom: 'Forêt 2' }],
  sdomZones: [{ nom: 'Zone 1' }, { nom: 'Zone 3' }],
  communes: [
    { nom: 'Flée', departementId: DEPARTEMENT_IDS.Sarthe },
    { nom: 'Montval-sur-loir', departementId: DEPARTEMENT_IDS.Sarthe },
    { nom: 'Tours', departementId: DEPARTEMENT_IDS['Indre-et-Loire'] },
    { nom: 'Ville de Guyane', departementId: DEPARTEMENT_IDS.Guyane }
  ]
}

export const Empty = Template.bind({})
Empty.args = {}
