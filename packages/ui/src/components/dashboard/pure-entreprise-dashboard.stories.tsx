import { PureEntrepriseDashboard } from './pure-entreprise-dashboard'
import { Meta, StoryFn } from '@storybook/vue3'
import { TitreEntreprise, entrepriseIdValidator, newEntrepriseId } from 'camino-common/src/entreprise'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { toCommuneId } from 'camino-common/src/static/communes'
import { titreIdValidator } from 'camino-common/src/titres'
import { vueRouter } from 'storybook-vue3-router'

const meta: Meta = {
  title: 'Components/Dashboard/Entreprise',
  component: PureEntrepriseDashboard,
  decorators: [
    vueRouter([
      { name: 'titre', params: { id: 'fourth-slug' } },
      { name: 'Stats DGTM', params: {} },
      { name: 'titre-creation', params: {} },
    ]),
  ],
}
export default meta

const titres: TitreEntreprise[] = [
  {
    id: titreIdValidator.parse('jp25TIfyQiXM987fAGc2DX4N'),
    slug: 'm-cx-aachen-1810',
    nom: 'Aachen',
    typeId: 'cxm',
    titreStatutId: 'ech',
    substances: ['ferx'],
    activitesEnConstruction: 2,
    activitesAbsentes: 3,
    titulaires: [
      {
        id: entrepriseIdValidator.parse('fr-793025370'),
        nom: 'NINOR',
      },
    ],
    communes: [{ id: toCommuneId('57000') }],
    references: [
      {
        referenceTypeId: 'rnt',
        nom: '57TM0014',
      },
    ],
  },
  {
    id: titreIdValidator.parse('mlWyShEGu8v7eYmsUhfiAMbs'),
    slug: 'm-ax-amadis-5-2022',
    nom: 'Amadis 5',
    typeId: 'axm',
    titreStatutId: 'val',
    substances: ['auru'],
    activitesEnConstruction: 1,
    activitesAbsentes: null,
    titulaires: [
      {
        id: entrepriseIdValidator.parse('fr-838049344'),
        nom: "CHAMB'OR",
      },
    ],
    communes: [{ id: toCommuneId('97300') }],
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

export const Ok: StoryFn = () => (
  <PureEntrepriseDashboard
    user={{ role: 'super', ...testBlankUser }}
    displayActivites={true}
    entreprises={[{ id: newEntrepriseId('id'), nom: 'entreprise1' }]}
    apiClient={{ getEntreprisesTitres: () => Promise.resolve(titres) }}
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
    apiClient={{ getEntreprisesTitres: () => Promise.resolve(titres) }}
  />
)

export const OkWithoutFiscalite: StoryFn = () => (
  <PureEntrepriseDashboard
    user={{ role: 'super', ...testBlankUser }}
    displayActivites={true}
    entreprises={[]}
    apiClient={{
      getEntreprisesTitres: () =>
        Promise.resolve([
          {
            id: titreIdValidator.parse('mlWyShEGu8v7eYmsUhfiAMbs'),
            slug: 'm-ax-amadis-5-2022',
            nom: 'Amadis 5',
            typeId: 'apw',
            titreStatutId: 'val',
            substances: ['auru'],
            activitesEnConstruction: null,
            activitesAbsentes: null,
            titulaires: [
              {
                id: entrepriseIdValidator.parse('fr-838049344'),
                nom: "CHAMB'OR",
              },
            ],
            communes: [{ id: toCommuneId('97300') }],
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
        ]),
    }}
  />
)

export const OkWithoutActivities: StoryFn = () => (
  <PureEntrepriseDashboard
    user={{ role: 'super', ...testBlankUser }}
    displayActivites={false}
    entreprises={[{ id: newEntrepriseId('id'), nom: 'entreprise1' }]}
    apiClient={{ getEntreprisesTitres: () => Promise.resolve(titres) }}
  />
)

export const Loading: StoryFn = () => (
  <PureEntrepriseDashboard
    user={{ role: 'super', ...testBlankUser }}
    displayActivites={false}
    entreprises={[{ id: newEntrepriseId('id'), nom: 'entreprise1' }]}
    apiClient={{ getEntreprisesTitres: () => new Promise<TitreEntreprise[]>(_resolve => {}) }}
  />
)

export const WithError: StoryFn = () => (
  <PureEntrepriseDashboard
    user={{ role: 'super', ...testBlankUser }}
    displayActivites={false}
    entreprises={[{ id: newEntrepriseId('id'), nom: 'entreprise1' }]}
    apiClient={{ getEntreprisesTitres: () => Promise.reject(new Error('because reasons')) }}
  />
)
