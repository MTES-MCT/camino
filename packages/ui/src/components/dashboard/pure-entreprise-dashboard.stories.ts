import PureEntrepriseDashboard from './pure-entreprise-dashboard.vue'
import { Meta, Story } from '@storybook/vue3'
import { TitreEntreprise } from '@/components/titres/table-utils'
import { DEPARTEMENT_IDS } from 'camino-common/src/static/departement'

const meta: Meta = {
  title: 'Components/PureEntrepriseDashboard',
  component: PureEntrepriseDashboard,
  argTypes: {
    getEntreprisesTitres: { name: 'function', required: true },
    displayActivites: { name: 'boolean' }
  }
}
export default meta

type Props = {
  getEntreprisesTitres: () => Promise<TitreEntreprise[]>
  displayActivites: boolean
}

const titres: TitreEntreprise[] = [
  {
    id: 'jp25TIfyQiXM987fAGc2DX4N',
    slug: 'm-cx-aachen-1810',
    nom: 'Aachen',
    type: {
      id: 'cxm',
      typeId: 'cx',
      domaineId: 'm',
      type: {
        id: 'ar',
        nom: 'autorisation de recherches'
      }
    },
    domaine: {
      id: 'm',
      nom: 'minéraux et métaux'
    },
    coordonnees: {
      x: 6.049336777414595,
      y: 49.45057350532248
    },
    statutId: 'ech',
    substances: ['ferx'],
    activitesEnConstruction: null,
    activitesAbsentes: null,
    titulaires: [
      {
        id: 'fr-793025370',
        nom: 'NINOR'
      }
    ],
    communes: [{ departementId: DEPARTEMENT_IDS.Moselle }],
    references: [
      {
        type: {
          nom: 'RNTM'
        },
        nom: '57TM0014'
      }
    ]
  },
  {
    id: 'mlWyShEGu8v7eYmsUhfiAMbs',
    slug: 'm-ax-amadis-5-2022',
    nom: 'Amadis 5',
    type: {
      id: 'axm',
      typeId: 'ax',
      domaineId: 'm',
      type: {
        id: 'ax',
        nom: "autorisation d'exploitation"
      }
    },
    domaine: {
      id: 'm',
      nom: 'minéraux et métaux'
    },
    statutId: 'val',
    substances: ['auru'],
    activitesEnConstruction: null,
    activitesAbsentes: null,
    titulaires: [
      {
        id: 'fr-838049344',
        nom: "CHAMB'OR"
      }
    ],
    communes: [{ departementId: DEPARTEMENT_IDS.Guyane }],
    references: [
      {
        type: {
          nom: 'DEAL'
        },
        nom: '01/2022'
      },
      {
        type: {
          nom: 'DEAL'
        },
        nom: 'X21-09'
      }
    ]
  }
]

const Template: Story<Props> = (args: Props) => ({
  components: { PureEntrepriseDashboard },
  setup() {
    return { args }
  },
  template: '<PureEntrepriseDashboard v-bind="args" />'
})

export const Ok = Template.bind({})
Ok.args = {
  getEntreprisesTitres: () => Promise.resolve(titres),
  displayActivites: true
}

export const OkWithoutActivities = Template.bind({})
OkWithoutActivities.args = {
  getEntreprisesTitres: () => Promise.resolve(titres),
  displayActivites: false
}
export const Loading = Template.bind({})
Loading.args = {
  getEntreprisesTitres: () => new Promise<TitreEntreprise[]>(resolve => {}),
  displayActivites: true
}
export const WithError = Template.bind({})
WithError.args = {
  getEntreprisesTitres: () => Promise.reject(new Error('because reasons')),
  displayActivites: true
}
