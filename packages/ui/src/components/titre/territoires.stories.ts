import { TerritoiresProps, Territoires } from './territoires'
import { Meta, Story } from '@storybook/vue3'
import { DEPARTEMENT_IDS } from 'camino-common/src/static/departement'

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
  surface: 4,
  forets: [],
  sdomZones: [],
  communes: [],
  secteursMaritimes: []
}

export const OnlyForets = Template.bind({})
OnlyForets.args = {
  surface: 0,
  sdomZones: [],
  communes: [],
  secteursMaritimes: [],
  forets: [{ nom: 'Forêt 1' }, { nom: 'Forêt 2' }]
}

export const OnlySdomZones = Template.bind({})
OnlySdomZones.args = {
  surface: 0,
  forets: [],
  communes: [],
  secteursMaritimes: [],
  sdomZones: ['1', '2']
}
export const OnlySecteursMaritimes = Template.bind({})
OnlySecteursMaritimes.args = {
  surface: 0,
  forets: [],
  sdomZones: [],
  communes: [],
  secteursMaritimes: ['Balagne', 'Bretagne nord', 'Bretagne sud']
}

export const All = Template.bind({})
All.args = {
  surface: 4,
  forets: [{ nom: 'Forêt 1' }, { nom: 'Forêt 2' }],
  sdomZones: ['1', '0'],
  communes: [
    { nom: 'Flée', departementId: DEPARTEMENT_IDS.Sarthe },
    { nom: 'Montval-sur-loir', departementId: DEPARTEMENT_IDS.Sarthe },
    { nom: 'Tours', departementId: DEPARTEMENT_IDS['Indre-et-Loire'] },
    { nom: 'Ville de Guyane', departementId: DEPARTEMENT_IDS.Guyane }
  ],
  secteursMaritimes: ['Balagne', 'Bretagne nord', 'Bretagne sud']
}

export const Empty = Template.bind({})
Empty.args = {
  surface: 0,
  forets: [],
  sdomZones: [],
  communes: [],
  secteursMaritimes: []
}
