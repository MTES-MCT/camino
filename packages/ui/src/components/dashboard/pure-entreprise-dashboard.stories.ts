import PureEntrepriseDashboard from './pure-entreprise-dashboard.vue'
import { Meta, Story } from '@storybook/vue3'
import { TitreEntreprise } from '@/components/titres/table-utils'
import { DEPARTEMENT_IDS } from 'camino-common/src/static/departement'
import { User } from 'camino-common/src/roles'

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
  user: User
  entrepriseId: string
}

const titres: TitreEntreprise[] = [
  {
    id: 'jp25TIfyQiXM987fAGc2DX4N',
    slug: 'm-cx-aachen-1810',
    nom: 'Aachen',
    domaineId: 'm',
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
    titreStatutId: 'ech',
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
        referenceTypeId: 'rnt',
        nom: '57TM0014'
      }
    ]
  },
  {
    id: 'mlWyShEGu8v7eYmsUhfiAMbs',
    slug: 'm-ax-amadis-5-2022',
    nom: 'Amadis 5',
    domaineId: 'm',
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
    titreStatutId: 'val',
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
        referenceTypeId: 'dea',
        nom: '01/2022'
      },
      {
        referenceTypeId: 'dea',
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
  user: { role: 'super', administrationId: undefined },
  entrepriseId: '1234',
  displayActivites: true
}

export const OkWithoutFiscalite = Template.bind({})
OkWithoutFiscalite.args = {
  getEntreprisesTitres: () =>
    Promise.resolve([
      {
        id: 'mlWyShEGu8v7eYmsUhfiAMbs',
        slug: 'm-ax-amadis-5-2022',
        nom: 'Amadis 5',
        domaineId: 'w',
        type: {
          id: 'axw',
          typeId: 'ax',
          domaineId: 'w',
          type: {
            id: 'ax',
            nom: "autorisation d'exploitation"
          }
        },
        domaine: {
          id: 'm',
          nom: 'minéraux et métaux'
        },
        titreStatutId: 'val',
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
            referenceTypeId: 'dea',
            nom: '01/2022'
          },
          {
            referenceTypeId: 'dea',
            nom: 'X21-09'
          }
        ]
      }
    ]),
  user: { role: 'super', administrationId: undefined },
  entrepriseId: '1234',
  displayActivites: true
}

export const OkWithoutActivities = Template.bind({})
OkWithoutActivities.args = {
  getEntreprisesTitres: () => Promise.resolve(titres),
  user: { role: 'super', administrationId: undefined },
  entrepriseId: '1234',
  displayActivites: false
}
export const Loading = Template.bind({})
Loading.args = {
  getEntreprisesTitres: () => new Promise<TitreEntreprise[]>(resolve => {}),
  user: { role: 'super', administrationId: undefined },
  entrepriseId: '1234',
  displayActivites: true
}
export const WithError = Template.bind({})
WithError.args = {
  getEntreprisesTitres: () => Promise.reject(new Error('because reasons')),
  user: { role: 'super', administrationId: undefined },
  entrepriseId: '1234',
  displayActivites: true
}
