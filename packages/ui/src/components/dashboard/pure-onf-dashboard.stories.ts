import { PureONFDashboard, Props } from './pure-onf-dashboard'
import { Meta, Story } from '@storybook/vue3'
import { CommonTitreONF } from 'camino-common/src/titres'
import titre from '@/store/titre'

const meta: Meta = {
  title: 'Components/PureONFDashboard',
  component: PureONFDashboard,
  argTypes: {
    getOnfTitres: { name: 'function', required: true }
  }
}
export default meta

const onfs: CommonTitreONF[] = [
  {
    id: 'firstId',
    slug: 'first-id-slug',
    nom: 'first-name',
    titreStatutId: 'dmi',
    domaineId: 'm',
    references: [],
    titulaires: [
      {
        nom: 'Titulaire1'
      }
    ],
    dateCompletudePTMG: '',
    dateReceptionONF: '',
    dateCARM: '',
    enAttenteDeONF: true
  },
  {
    id: 'secondId',
    slug: 'second-slug',
    nom: 'Second Nom de titre',
    titreStatutId: 'dmi',
    domaineId: 'm',
    references: [
      {
        nom: '2010-001',
        referenceTypeId: 'onf'
      },
      { nom: '2010-000', referenceTypeId: 'ptm' }
    ],
    titulaires: [
      {
        nom: 'Titulaire3'
      }
    ],
    dateCompletudePTMG: '2022-03-23',
    dateReceptionONF: '2022-03-24',
    dateCARM: '2022-04-12',
    enAttenteDeONF: true
  },
  {
    id: 'thirdId',
    slug: 'third-id-slug',
    nom: 'third-name',
    titreStatutId: 'dmi',
    domaineId: 'm',
    references: [],
    titulaires: [
      {
        nom: 'Titulaire1'
      }
    ],
    dateCompletudePTMG: '',
    dateReceptionONF: '',
    dateCARM: '',
    enAttenteDeONF: false
  },
  {
    id: 'fourthId',
    slug: 'fourth-slug',
    nom: 'Quatrième Nom de titre',
    titreStatutId: 'dmi',
    domaineId: 'm',
    references: [
      {
        nom: '2010-001',
        referenceTypeId: 'onf'
      },
      { nom: '2010-000', referenceTypeId: 'ptm' }
    ],
    titulaires: [
      {
        nom: 'Titulaire 8'
      }
    ],
    dateCompletudePTMG: '2022-03-23',
    dateReceptionONF: '2022-03-24',
    dateCARM: '2022-04-12',
    enAttenteDeONF: true
  }
]

const Template: Story<Props> = (args: Props) => ({
  components: { PureONFDashboard },
  setup() {
    return { args }
  },
  template: '<div><PureONFDashboard v-bind="args" /></div>'
})

export const Ok = Template.bind(
  {},
  {
    getOnfTitres: () => Promise.resolve(onfs)
  }
)

export const OkSansAttenteDeONF = Template.bind(
  {},
  {
    getOnfTitres: () =>
      Promise.resolve(onfs.map(titre => ({ ...titre, enAttenteDeONF: false })))
  }
)

export const Loading = Template.bind(
  {},
  {
    getOnfTitres: () => new Promise<CommonTitreONF[]>(resolve => {})
  }
)
export const WithError = Template.bind(
  {},
  {
    getOnfTitres: () => Promise.reject(new Error('because reasons'))
  }
)
