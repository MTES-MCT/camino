import PurePTMGDashboard from './pure-ptmg-dashboard.vue'
import { Meta, Story } from '@storybook/vue3'
import { CommonTitrePTMG } from 'camino-common/src/titres'

const meta: Meta = {
  title: 'Components/PurePTMGDashboard',
  component: PurePTMGDashboard,
  argTypes: {
    getPtmgTitres: { name: 'function', required: true },
    displayActivites: { name: 'boolean' }
  }
}
export default meta

type Props = {
  getPtmgTitres: () => Promise<CommonTitrePTMG[]>
  displayActivites: boolean
}

const titres: CommonTitrePTMG[] = [
  {
    id: 'firstId',
    slug: 'first-id-slug',
    nom: 'first-name',
    statutId: 'dmi',
    references: [],
    titulaires: [
      {
        nom: 'Titulaire1'
      }
    ],
    enAttenteDePTMG: true
  },
  {
    id: 'secondId',
    slug: 'second-slug',
    nom: 'Second Nom de titre',
    statutId: 'dmi',
    references: [
      {
        nom: '2010-001',
        type: { nom: 'PTMG' }
      },
      { nom: '2010-000', type: { nom: 'PTMG' } }
    ],
    titulaires: [
      {
        nom: 'Titulaire3'
      }
    ],
    enAttenteDePTMG: true
  },
  {
    id: 'thirdId',
    slug: 'third-id-slug',
    nom: 'third-name',
    statutId: 'dmi',
    references: [],
    titulaires: [
      {
        nom: 'Titulaire1'
      }
    ],
    enAttenteDePTMG: false
  },
  {
    id: 'fourthId',
    slug: 'fourth-slug',
    nom: 'Quatrième Nom de titre',
    statutId: 'dmi',
    references: [
      {
        nom: '2010-001',
        type: { nom: 'PTMG' }
      },
      { nom: '2010-000', type: { nom: 'PTMG' } }
    ],
    titulaires: [
      {
        nom: 'Titulaire 8'
      }
    ],
    enAttenteDePTMG: true
  }
]

const Template: Story<Props> = (args: Props) => ({
  components: { PurePTMGDashboard },
  setup() {
    return { args }
  },
  template: '<div><PurePTMGDashboard v-bind="args" /></div>'
})

export const Ok = Template.bind({})
Ok.args = {
  getPtmgTitres: () => Promise.resolve(titres),
  displayActivites: true
}

export const Loading = Template.bind({})
Loading.args = {
  getPtmgTitres: () => new Promise<CommonTitrePTMG[]>(resolve => {}),
  displayActivites: true
}
export const WithError = Template.bind({})
WithError.args = {
  getPtmgTitres: () => Promise.reject(new Error('because reasons')),
  displayActivites: true
}
