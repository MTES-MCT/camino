import { PurePTMGDashboard } from './pure-ptmg-dashboard'
import { Meta, StoryFn } from '@storybook/vue3'
import { CommonTitrePTMG } from 'camino-common/src/titres'

const meta: Meta = {
  title: 'Components/Dashboard/PTMG',
  component: PurePTMGDashboard,
}
export default meta

const titres: CommonTitrePTMG[] = [
  {
    id: 'firstId',
    slug: 'first-id-slug',
    nom: 'first-name',
    titreStatutId: 'dmi',
    references: [],
    typeId: 'arm',
    titulaires: [
      {
        nom: 'Titulaire1',
      },
    ],
    enAttenteDePTMG: true,
  },
  {
    id: 'secondId',
    slug: 'second-slug',
    nom: 'Second Nom de titre',
    titreStatutId: 'dmi',
    typeId: 'arm',
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
    id: 'thirdId',
    slug: 'third-id-slug',
    nom: 'third-name',
    titreStatutId: 'dmi',
    typeId: 'arm',
    references: [],
    titulaires: [
      {
        nom: 'Titulaire1',
      },
    ],
    enAttenteDePTMG: false,
  },
  {
    id: 'fourthId',
    slug: 'fourth-slug',
    nom: 'Quatrième Nom de titre',
    titreStatutId: 'dmi',
    typeId: 'arm',
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

export const Ok: StoryFn = () => <PurePTMGDashboard getPtmgTitres={() => Promise.resolve(titres)} />
export const Loading: StoryFn = () => <PurePTMGDashboard getPtmgTitres={() => new Promise<CommonTitrePTMG[]>(resolve => {})} />
export const WithError: StoryFn = () => <PurePTMGDashboard getPtmgTitres={() => Promise.reject(new Error('because reasons'))} />
