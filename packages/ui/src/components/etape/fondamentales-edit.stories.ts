import FondatementalesEditComponent from './fondamentales-edit.vue'
import { Meta, Story } from '@storybook/vue3'
import { EtapeFondamentale } from 'camino-common/src/etape'
import { Entreprise, newEntrepriseId } from 'camino-common/src/entreprise'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { DomaineId } from 'camino-common/src/static/domaines'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Etape/FondamentalesEdit',
  component: FondatementalesEditComponent,
  argTypes: {}
}
export default meta

type Props = {
  etape: EtapeFondamentale
  domaineId: DomaineId
  demarcheTypeId: DemarcheTypeId
  titreTypeId: TitreTypeTypeId
  userIsAdmin: boolean
  userIsSuper: boolean
  entreprises: Entreprise[]
}

const Template: Story<Props> = (args: Props) => ({
  components: { FondatementalesEditComponent },
  setup() {
    return { args }
  },
  data: () => ({ etapeData: {} }),
  watch: {
    args: {
      handler: function (newValue) {
        this.etapeData = newValue.etape
      },
      immediate: true
    }
  },
  template: '<FondatementalesEditComponent v-bind="args" :etape="etapeData"/>'
})

export const Default = Template.bind({})

// FIXME écrire d’autres tests
Default.args = {
  etape: {
    type: {
      id: 'mfr',
      nom: 'demande'
    },
    contenu: {},
    date: toCaminoDate('2022-02-02'),
    dateDebut: toCaminoDate('2022-02-02'),
    dateFin: undefined,
    duree: 4,
    incertitudes: {
      date: false,
      duree: false,
      dateDebut: false,
      dateFin: false,
      amodiataires: false,
      titulaires: true,
      substances: false
    },
    substances: ['arse'],
    titulaires: [{ id: newEntrepriseId('optionId1'), operateur: true }],
    amodiataires: [],
    heritageProps: {
      dateDebut: {
        actif: false
      },
      dateFin: {
        actif: false
      },
      duree: {
        actif: false
      },
      substances: {
        actif: true,
        etape: {
          date: toCaminoDate('2022-01-01'),
          type: {
            id: 'mfr',
            nom: 'étape précédente'
          },
          substances: ['arge']
        }
      },
      titulaires: {
        actif: false
      },
      amodiataires: {
        actif: false
      }
    }
  },
  domaineId: 'm',
  demarcheTypeId: 'oct',
  titreTypeId: 'ar',
  userIsAdmin: true,
  userIsSuper: true,
  entreprises: [
    { id: newEntrepriseId('optionId1'), nom: 'optionNom1', etablissements: [] }
  ]
}
