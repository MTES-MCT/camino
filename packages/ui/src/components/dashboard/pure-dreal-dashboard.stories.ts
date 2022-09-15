import PureDrealDashboard from './pure-dreal-dashboard.vue'
import { Meta, Story } from '@storybook/vue3'
import { CommonTitreDREAL } from 'camino-common/src/titres'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { statistiquesDGTMFake } from './testData'
const meta: Meta = {
  title: 'Components/PureDrealDashboard',
  component: PureDrealDashboard,
  argTypes: {
    getEntreprisesTitres: { name: 'function', required: true },
    displayActivites: { name: 'boolean' }
  }
}
export default meta

type Props = {
  getDrealTitres: () => Promise<CommonTitreDREAL[]>
  isDGTM: boolean
  getDgtmStats: () => Promise<StatistiquesDGTM>
}

const titres: CommonTitreDREAL[] = [
  {
    id: 'firstId',
    slug: 'first-id-slug',
    nom: 'first-name',
    domaineId: 'm',
    typeId: 'pr',
    titreStatutId: 'dmi',
    references: [],
    titulaires: [
      {
        nom: 'Titulaire1'
      }
    ],
    activitesAbsentes: 0,
    activitesEnConstruction: 0,
    enAttenteDeDREAL: false
  },
  {
    id: 'secondId',
    slug: 'second-slug',
    nom: 'Second Nom de titre',
    domaineId: 'm',
    typeId: 'pr',
    titreStatutId: 'dmi',
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
    activitesEnConstruction: 2,
    activitesAbsentes: 0,
    enAttenteDeDREAL: true
  },
  {
    id: 'thirdId',
    slug: 'third-id-slug',
    nom: 'third-name',
    domaineId: 'm',
    typeId: 'pr',
    titreStatutId: 'dmi',
    references: [],
    titulaires: [
      {
        nom: 'Titulaire1'
      }
    ],
    activitesAbsentes: 0,
    activitesEnConstruction: 3,
    enAttenteDeDREAL: false
  },
  {
    id: 'fourthId',
    slug: 'fourth-slug',
    nom: 'Quatrième Nom de titre',
    domaineId: 'c',
    typeId: 'ar',
    titreStatutId: 'dmi',
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
    activitesEnConstruction: 8,
    activitesAbsentes: 2,
    enAttenteDeDREAL: false
  }
]

const Template: Story<Props> = (args: Props) => ({
  components: { PureDrealDashboard },
  setup() {
    return { args }
  },
  template: '<PureDrealDashboard v-bind="args" />'
})

export const Ok = Template.bind({})
Ok.args = {
  getDrealTitres: () => Promise.resolve(titres),
  isDGTM: false,
  getDgtmStats: () => Promise.resolve({ depotEtInstructions: {} })
}

export const OkDGTM = Template.bind({})
OkDGTM.args = {
  getDrealTitres: () => Promise.resolve(titres),
  isDGTM: true,
  getDgtmStats: () => Promise.resolve(statistiquesDGTMFake)
}

export const Loading = Template.bind({})
Loading.args = {
  getDrealTitres: () => new Promise<CommonTitreDREAL[]>(resolve => {}),
  isDGTM: false,
  getDgtmStats: () => Promise.resolve({ depotEtInstructions: {} })
}
export const WithError = Template.bind({})
WithError.args = {
  getDrealTitres: () => Promise.reject(new Error('because reasons')),
  isDGTM: false,
  getDgtmStats: () => Promise.resolve({ depotEtInstructions: {} })
}
