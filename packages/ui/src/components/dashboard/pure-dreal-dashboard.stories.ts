import PureDrealDashboard from './pure-dreal-dashboard.vue'
import { Meta, Story } from '@storybook/vue3'
import { CommonTitreDREAL } from 'camino-common/src/titres'

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
}

const titres: CommonTitreDREAL[] = [
  {
    id: 'firstId',
    slug: 'first-id-slug',
    nom: 'first-name',
    domaineId: 'm',
    typeId: 'pr',
    statut: {
      nom: 'demande initiale',
      couleur: 'warning'
    },
    references: [],
    titulaires: [
      {
        nom: 'Titulaire1'
      }
    ],
    activitesAbsentes: 0,
    activitesEnConstruction: 0
  },
  {
    id: 'secondId',
    slug: 'second-slug',
    nom: 'Second Nom de titre',
    domaineId: 'm',
    typeId: 'pr',
    statut: {
      nom: 'demande initiale',
      couleur: 'warning'
    },
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
    activitesAbsentes: 0
  },
  {
    id: 'thirdId',
    slug: 'third-id-slug',
    nom: 'third-name',
    domaineId: 'm',
    typeId: 'pr',
    statut: {
      nom: 'demande initiale',
      couleur: 'warning'
    },
    references: [],
    titulaires: [
      {
        nom: 'Titulaire1'
      }
    ],
    activitesAbsentes: 0,
    activitesEnConstruction: 3
  },
  {
    id: 'fourthId',
    slug: 'fourth-slug',
    nom: 'Quatrième Nom de titre',
    domaineId: 'c',
    typeId: 'ar',
    statut: {
      nom: 'demande initiale',
      couleur: 'warning'
    },
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
    activitesAbsentes: 2
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
  getDrealTitres: () => Promise.resolve(titres)
}

export const Loading = Template.bind({})
Loading.args = {
  getDrealTitres: () => new Promise<CommonTitreDREAL[]>(resolve => {})
}
export const WithError = Template.bind({})
WithError.args = {
  getDrealTitres: () => Promise.reject(new Error('because reasons'))
}
