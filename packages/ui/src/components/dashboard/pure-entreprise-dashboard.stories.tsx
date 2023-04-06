import { PureEntrepriseDashboard, Props } from './pure-entreprise-dashboard'
import { Meta, StoryFn } from '@storybook/vue3'
import { DEPARTEMENT_IDS } from 'camino-common/src/static/departement'
import { TitreEntreprise, newEntrepriseId } from 'camino-common/src/entreprise'
import { testBlankUser } from 'camino-common/src/tests-utils'

const meta: Meta = {
  title: 'Components/Dashboard/Entreprise',
  component: PureEntrepriseDashboard,
  argTypes: {
    getEntreprisesTitres: { name: 'function', required: true },
    displayActivites: { name: 'boolean' },
  },
}
export default meta

const titres: TitreEntreprise[] = [
  {
    id: 'jp25TIfyQiXM987fAGc2DX4N',
    slug: 'm-cx-aachen-1810',
    nom: 'Aachen',
    typeId: 'cxm',
    coordonnees: {
      x: 6.049336777414595,
      y: 49.45057350532248,
    },
    titreStatutId: 'ech',
    substances: ['ferx'],
    activitesEnConstruction: 2,
    activitesAbsentes: 3,
    titulaires: [
      {
        id: 'fr-793025370',
        nom: 'NINOR',
      },
    ],
    communes: [{ departementId: DEPARTEMENT_IDS.Moselle }],
    references: [
      {
        referenceTypeId: 'rnt',
        nom: '57TM0014',
      },
    ],
  },
  {
    id: 'mlWyShEGu8v7eYmsUhfiAMbs',
    slug: 'm-ax-amadis-5-2022',
    nom: 'Amadis 5',
    typeId: 'axm',
    titreStatutId: 'val',
    substances: ['auru'],
    activitesEnConstruction: 1,
    activitesAbsentes: null,
    titulaires: [
      {
        id: 'fr-838049344',
        nom: "CHAMB'OR",
      },
    ],
    communes: [{ departementId: DEPARTEMENT_IDS.Guyane }],
    references: [
      {
        referenceTypeId: 'dea',
        nom: '01/2022',
      },
      {
        referenceTypeId: 'dea',
        nom: 'X21-09',
      },
    ],
  },
]

const Template: StoryFn<Props> = (args: Props) => ({
  components: { PureEntrepriseDashboard },
  setup() {
    return { args }
  },
  template: '<PureEntrepriseDashboard v-bind="args" />',
})

export const Ok: StoryFn = () => (
  <PureEntrepriseDashboard
    user={{ role: 'super', ...testBlankUser }}
    displayActivites={true}
    entreprises={[{ id: newEntrepriseId('id'), nom: 'entreprise1' }]}
    getEntreprisesTitres={() => Promise.resolve(titres)}
  />
)

export const OkWithMultipleEntreprises: StoryFn = () => (
  <PureEntrepriseDashboard
    user={{ role: 'super', ...testBlankUser }}
    displayActivites={true}
    entreprises={[
      { id: newEntrepriseId('id'), nom: 'entreprise1' },
      { id: newEntrepriseId('id2'), nom: 'entreprise2' },
    ]}
    getEntreprisesTitres={() => Promise.resolve(titres)}
  />
)

export const OkWithoutFiscalite: StoryFn = () => (
  <PureEntrepriseDashboard
    user={{ role: 'super', ...testBlankUser }}
    displayActivites={true}
    entreprises={[]}
    getEntreprisesTitres={() =>
      Promise.resolve([
        {
          id: 'mlWyShEGu8v7eYmsUhfiAMbs',
          slug: 'm-ax-amadis-5-2022',
          nom: 'Amadis 5',
          typeId: 'apw',
          titreStatutId: 'val',
          substances: ['auru'],
          activitesEnConstruction: null,
          activitesAbsentes: null,
          titulaires: [
            {
              id: 'fr-838049344',
              nom: "CHAMB'OR",
            },
          ],
          communes: [{ departementId: DEPARTEMENT_IDS.Guyane }],
          references: [
            {
              referenceTypeId: 'dea',
              nom: '01/2022',
            },
            {
              referenceTypeId: 'dea',
              nom: 'X21-09',
            },
          ],
        },
      ])
    }
  />
)

export const OkWithoutActivities: StoryFn = () => (
  <PureEntrepriseDashboard
    user={{ role: 'super', ...testBlankUser }}
    displayActivites={false}
    entreprises={[{ id: newEntrepriseId('id'), nom: 'entreprise1' }]}
    getEntreprisesTitres={() => Promise.resolve(titres)}
  />
)

export const Loading: StoryFn = () => (
  <PureEntrepriseDashboard
    user={{ role: 'super', ...testBlankUser }}
    displayActivites={false}
    entreprises={[{ id: newEntrepriseId('id'), nom: 'entreprise1' }]}
    getEntreprisesTitres={() => new Promise<TitreEntreprise[]>(resolve => {})}
  />
)

export const WithError: StoryFn = () => (
  <PureEntrepriseDashboard
    user={{ role: 'super', ...testBlankUser }}
    displayActivites={false}
    entreprises={[{ id: newEntrepriseId('id'), nom: 'entreprise1' }]}
    getEntreprisesTitres={() => Promise.reject(new Error('because reasons'))}
  />
)
