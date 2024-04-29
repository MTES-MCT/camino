import { PureONFDashboard } from './pure-onf-dashboard'
import { Meta, StoryFn } from '@storybook/vue3'
import { CommonTitreONF } from 'camino-common/src/titres'
import { titreIdValidator, titreSlugValidator } from 'camino-common/src/validators/titres'

const meta: Meta = {
  title: 'Components/Dashboard/ONF',
  component: PureONFDashboard,
}
export default meta

const onfs: CommonTitreONF[] = [
  {
    id: titreIdValidator.parse('firstId'),
    slug: titreSlugValidator.parse('first-id-slug'),
    nom: 'first-name',
    titre_statut_id: 'dmi',
    type_id: 'arm',
    references: [],
    titulaires: [
      {
        nom: 'Titulaire1',
      },
    ],
    dateCompletudePTMG: '',
    dateReceptionONF: '',
    dateCARM: '',
    enAttenteDeONF: true,
  },
  {
    id: titreIdValidator.parse('secondId'),
    slug: titreSlugValidator.parse('second-slug'),
    nom: 'Second Nom de titre',
    titre_statut_id: 'dmi',
    type_id: 'arm',
    references: [
      {
        nom: '2010-001',
        referenceTypeId: 'onf',
      },
      { nom: '2010-000', referenceTypeId: 'ptm' },
    ],
    titulaires: [
      {
        nom: 'Titulaire3',
      },
    ],
    dateCompletudePTMG: '2022-03-23',
    dateReceptionONF: '2022-03-24',
    dateCARM: '2022-04-12',
    enAttenteDeONF: true,
  },
  {
    id: titreIdValidator.parse('thirdId'),
    slug: titreSlugValidator.parse('third-id-slug'),
    nom: 'third-name',
    titre_statut_id: 'dmi',
    type_id: 'arm',
    references: [],
    titulaires: [
      {
        nom: 'Titulaire1',
      },
    ],
    dateCompletudePTMG: '',
    dateReceptionONF: '',
    dateCARM: '',
    enAttenteDeONF: false,
  },
  {
    id: titreIdValidator.parse('fourthId'),
    slug: titreSlugValidator.parse('fourth-slug'),
    nom: 'Quatrième Nom de titre',
    titre_statut_id: 'dmi',
    type_id: 'arm',
    references: [
      {
        nom: '2010-001',
        referenceTypeId: 'onf',
      },
      { nom: '2010-000', referenceTypeId: 'ptm' },
    ],
    titulaires: [
      {
        nom: 'Titulaire 8',
      },
    ],
    dateCompletudePTMG: '2022-03-23',
    dateReceptionONF: '2022-03-24',
    dateCARM: '2022-04-12',
    enAttenteDeONF: true,
  },
]

export const Ok: StoryFn = () => <PureONFDashboard apiClient={{ getOnfTitres: () => Promise.resolve(onfs) }} />
export const OkSansAttenteDeONF: StoryFn = () => <PureONFDashboard apiClient={{ getOnfTitres: () => Promise.resolve(onfs.map(titre => ({ ...titre, enAttenteDeONF: false }))) }} />
export const Loading: StoryFn = () => <PureONFDashboard apiClient={{ getOnfTitres: () => new Promise<CommonTitreONF[]>(_resolve => {}) }} />
export const WithError: StoryFn = () => <PureONFDashboard apiClient={{ getOnfTitres: () => Promise.reject(new Error('because reasons')) }} />
