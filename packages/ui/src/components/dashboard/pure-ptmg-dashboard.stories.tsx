import { PurePTMGDashboard } from './pure-ptmg-dashboard'
import { Meta, StoryFn } from '@storybook/vue3'
import { CommonTitrePTMG, titreIdValidator } from 'camino-common/src/titres'
import { vueRouter } from 'storybook-vue3-router'

const meta: Meta = {
  title: 'Components/Dashboard/PTMG',
  component: PurePTMGDashboard,
  decorators: [
    vueRouter([
      { name: 'titre', params: { id: 'fourth-slug' } },
      { name: 'Stats DGTM', params: {} },
    ]),
  ],
}
export default meta

const titres: CommonTitrePTMG[] = [
  {
    id: titreIdValidator.parse('firstId'),
    slug: 'first-id-slug',
    nom: 'first-name',
    titre_statut_id: 'dmi',
    references: [],
    type_id: 'arm',
    titulaires: [
      {
        nom: 'Titulaire1',
      },
    ],
    enAttenteDePTMG: true,
  },
  {
    id: titreIdValidator.parse('secondId'),
    slug: 'second-slug',
    nom: 'Second Nom de titre',
    titre_statut_id: 'dmi',
    type_id: 'arm',
    references: [
      {
        nom: '2010-001',
        referenceTypeId: 'ptm',
      },
      { nom: '2010-000', referenceTypeId: 'ptm' },
    ],
    titulaires: [
      {
        nom: 'Titulaire3',
      },
    ],
    enAttenteDePTMG: true,
  },
  {
    id: titreIdValidator.parse('thirdId'),
    slug: 'third-id-slug',
    nom: 'third-name',
    titre_statut_id: 'dmi',
    type_id: 'arm',
    references: [],
    titulaires: [
      {
        nom: 'Titulaire1',
      },
    ],
    enAttenteDePTMG: false,
  },
  {
    id: titreIdValidator.parse('fourthId'),
    slug: 'fourth-slug',
    nom: 'Quatrième Nom de titre',
    titre_statut_id: 'dmi',
    type_id: 'arm',
    references: [
      {
        nom: '2010-001',
        referenceTypeId: 'ptm',
      },
      { nom: '2010-000', referenceTypeId: 'ptm' },
    ],
    titulaires: [
      {
        nom: 'Titulaire 8',
      },
    ],
    enAttenteDePTMG: true,
  },
]

export const Ok: StoryFn = () => <PurePTMGDashboard apiClient={{ getPtmgTitres: () => Promise.resolve(titres) }} />
export const Loading: StoryFn = () => <PurePTMGDashboard apiClient={{ getPtmgTitres: () => new Promise<CommonTitrePTMG[]>(resolve => {}) }} />
export const WithError: StoryFn = () => <PurePTMGDashboard apiClient={{ getPtmgTitres: () => Promise.reject(new Error('because reasons')) }} />
