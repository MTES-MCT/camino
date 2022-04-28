import PureDashboard from './pure-dashboard.vue'
import { Meta, Story } from '@storybook/vue3'
import { Entreprise } from '@/components/titres/table-utils'

const meta: Meta = {
  title: 'Components/PureDashboard',
  component: PureDashboard,
  argTypes: {
    getEntreprisesTitres: { name: 'function', required: true },
    displayActivites: { name: 'boolean' }
  }
}
export default meta

type Props = {
  getEntreprisesTitres: () => Promise<Entreprise[]>
  displayActivites: boolean
}

const entreprises: Entreprise[] = [
  {
    id: 'nrBiyeRZbRlaNUhvhSOsXEEX',
    slug: 'm-ar-220222-2022',
    nom: '220222',
    type: {
      id: 'arm',
      typeId: 'ar',
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
      x: -52.375533070510286,
      y: 4.066841449742672
    },
    statut: {
      id: 'dmi',
      nom: 'demande initiale',
      couleur: 'warning'
    },
    substances: [
      {
        id: 'auru',
        nom: 'or'
      }
    ],
    activitesEnConstruction: null,
    activitesAbsentes: null,
    titulaires: [
      {
        id: 'fr-793025370',
        nom: 'NINOR'
      }
    ],
    pays: [
      {
        regions: [
          {
            nom: 'Guyane',
            departements: [
              {
                nom: 'Guyane'
              }
            ]
          }
        ]
      }
    ],
    references: []
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
    coordonnees: {
      x: -53.90095961691949,
      y: 5.067649535503341
    },
    statut: {
      id: 'val',
      nom: 'valide',
      couleur: 'success'
    },
    substances: [
      {
        id: 'auru',
        nom: 'or'
      }
    ],
    activitesEnConstruction: null,
    activitesAbsentes: null,
    titulaires: [
      {
        id: 'fr-838049344',
        nom: "CHAMB'OR"
      }
    ],
    pays: [
      {
        regions: [
          {
            nom: 'Guyane',
            departements: [
              {
                nom: 'Guyane'
              }
            ]
          }
        ]
      }
    ],
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
  components: { PureDashboard },
  setup() {
    return { args }
  },
  template: '<PureDashboard v-bind="args" />'
})

export const Ok = Template.bind({})
Ok.args = {
  getEntreprisesTitres: () => Promise.resolve(entreprises),
  displayActivites: true
}

export const OkWithoutActivities = Template.bind({})
OkWithoutActivities.args = {
  getEntreprisesTitres: () => Promise.resolve(entreprises),
  displayActivites: false
}
export const Loading = Template.bind({})
Loading.args = {
  getEntreprisesTitres: () => new Promise<Entreprise[]>(resolve => {}),
  displayActivites: true
}
export const WithError = Template.bind({})
WithError.args = {
  getEntreprisesTitres: () => Promise.reject(new Error('because reasons')),
  displayActivites: true
}
