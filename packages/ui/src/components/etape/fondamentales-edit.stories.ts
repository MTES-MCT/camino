import FondatementalesEditComponent from './fondamentales-edit.vue'
import { Meta, Story } from '@storybook/vue3'
import { EtapeFondamentale } from 'camino-common/src/etape'
import { Entreprise, newEntrepriseId } from 'camino-common/src/entreprise'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { toCaminoDate } from 'camino-common/src/date'
import { User } from 'camino-common/src/roles'

const meta: Meta = {
  title: 'Components/Etape/FondamentalesEdit',
  component: FondatementalesEditComponent,
  argTypes: {}
}
export default meta

type Props = {
  etape: EtapeFondamentale
  demarcheTypeId: DemarcheTypeId
  titreTypeId: TitreTypeId
  user: User
  entreprises: Entreprise[]
}

const etape: EtapeFondamentale = {
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
        substances: ['arge'],
        incertitudes: { substances: true }
      }
    },
    titulaires: {
      actif: false
    },
    amodiataires: {
      actif: false
    }
  }
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

export const ArmDemandeONF = Template.bind(
  {},
  {
    etape,
    demarcheTypeId: 'oct',
    titreTypeId: 'arm',
    user: { role: 'admin', administrationId: 'ope-onf-973-01' },
    entreprises: [
      {
        id: newEntrepriseId('optionId1'),
        nom: 'optionNom1',
        etablissements: []
      }
    ]
  }
)

export const ArmDemandeOperateur = Template.bind(
  {},
  {
    etape,
    demarcheTypeId: 'oct',
    titreTypeId: 'arm',
    user: { role: 'entreprise', administrationId: undefined },
    entreprises: [
      {
        id: newEntrepriseId('optionId1'),
        nom: 'optionNom1',
        etablissements: []
      }
    ]
  }
)

export const ArmJorfONF = Template.bind(
  {},
  {
    etape: { ...etape, type: { id: 'dpu', nom: 'Jorf' } },
    demarcheTypeId: 'oct',
    titreTypeId: 'arm',
    user: { role: 'admin', administrationId: 'ope-onf-973-01' },
    entreprises: [
      {
        id: newEntrepriseId('optionId1'),
        nom: 'optionNom1',
        etablissements: []
      }
    ]
  }
)

export const AxmDemandeONF = Template.bind(
  {},
  {
    etape,
    demarcheTypeId: 'oct',
    titreTypeId: 'axm',
    user: { role: 'admin', administrationId: 'ope-onf-973-01' },
    entreprises: [
      {
        id: newEntrepriseId('optionId1'),
        nom: 'optionNom1',
        etablissements: []
      }
    ]
  }
)

export const PrmDemandeONF = Template.bind(
  {},
  {
    etape,
    demarcheTypeId: 'oct',
    titreTypeId: 'prm',
    user: { role: 'admin', administrationId: 'ope-onf-973-01' },
    entreprises: [
      {
        id: newEntrepriseId('optionId1'),
        nom: 'optionNom1',
        etablissements: []
      }
    ]
  }
)

export const PrmDeplacementDePerimetreONF = Template.bind(
  {},
  {
    etape,
    demarcheTypeId: 'dep',
    titreTypeId: 'prm',
    user: { role: 'admin', administrationId: 'ope-onf-973-01' },
    entreprises: [
      {
        id: newEntrepriseId('optionId1'),
        nom: 'optionNom1',
        etablissements: []
      }
    ]
  }
)
