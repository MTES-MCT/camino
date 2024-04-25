import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { PureONFDashboard } from './pure-onf-dashboard'
import { Meta, StoryFn } from '@storybook/vue3'
import { CommonTitreONF } from 'camino-common/src/titres'
import { titreIdValidator, titreSlugValidator } from 'camino-common/src/validators/titres'
import { entreprises } from './testData'

const meta: Meta = {
  title: 'Components/Dashboard/ONF',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
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
    titulaireIds: [entrepriseIdValidator.parse('Titulaire1')],
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
    titulaireIds: [entrepriseIdValidator.parse('Titulaire3')],
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
    titulaireIds: [entrepriseIdValidator.parse('Titulaire1')],
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
    titulaireIds: [entrepriseIdValidator.parse('Titulaire8')],
    dateCompletudePTMG: '2022-03-23',
    dateReceptionONF: '2022-03-24',
    dateCARM: '2022-04-12',
    enAttenteDeONF: true,
  },
]

export const Ok: StoryFn = () => <PureONFDashboard apiClient={{ getOnfTitres: () => Promise.resolve(onfs) }} entreprises={entreprises} />
export const OkSansAttenteDeONF: StoryFn = () => (
  <PureONFDashboard apiClient={{ getOnfTitres: () => Promise.resolve(onfs.map(titre => ({ ...titre, enAttenteDeONF: false }))) }} entreprises={entreprises} />
)
export const Loading: StoryFn = () => <PureONFDashboard apiClient={{ getOnfTitres: () => new Promise<CommonTitreONF[]>(_resolve => {}) }} entreprises={entreprises} />
export const WithError: StoryFn = () => <PureONFDashboard apiClient={{ getOnfTitres: () => Promise.reject(new Error('because reasons')) }} entreprises={entreprises} />
