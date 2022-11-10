import FondatementalesEditComponent from './fondamentales-edit.vue'
import { Meta, Story } from '@storybook/vue3'
import { EtapeFondamentale } from 'camino-common/src/etape'
import { Entreprise, newEntrepriseId } from 'camino-common/src/entreprise'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { DomaineId } from 'camino-common/src/static/domaines'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'
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
  domaineId: DomaineId
  demarcheTypeId: DemarcheTypeId
  titreTypeTypeId: TitreTypeTypeId
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

export const ArmDemandeONF = Template.bind({})

ArmDemandeONF.args = {
  etape,
  domaineId: 'm',
  demarcheTypeId: 'oct',
  titreTypeTypeId: 'ar',
  user: { role: 'admin', administrationId: 'ope-onf-973-01' },
  entreprises: [
    { id: newEntrepriseId('optionId1'), nom: 'optionNom1', etablissements: [] }
  ]
}

export const ArmDemandeOperateur = Template.bind({})

ArmDemandeOperateur.args = {
  etape,
  domaineId: 'm',
  demarcheTypeId: 'oct',
  titreTypeTypeId: 'ar',
  user: { role: 'entreprise', administrationId: undefined },
  entreprises: [
    { id: newEntrepriseId('optionId1'), nom: 'optionNom1', etablissements: [] }
  ]
}

export const ArmJorfONF = Template.bind({})

ArmJorfONF.args = {
  etape: { ...etape, type: { id: 'dpu', nom: 'Jorf' } },
  domaineId: 'm',
  demarcheTypeId: 'oct',
  titreTypeTypeId: 'ar',
  user: { role: 'admin', administrationId: 'ope-onf-973-01' },
  entreprises: [
    { id: newEntrepriseId('optionId1'), nom: 'optionNom1', etablissements: [] }
  ]
}

export const AxmDemandeONF = Template.bind({})

AxmDemandeONF.args = {
  etape,
  domaineId: 'm',
  demarcheTypeId: 'oct',
  titreTypeTypeId: 'ax',
  user: { role: 'admin', administrationId: 'ope-onf-973-01' },
  entreprises: [
    { id: newEntrepriseId('optionId1'), nom: 'optionNom1', etablissements: [] }
  ]
}

export const PrmDemandeONF = Template.bind({})

PrmDemandeONF.args = {
  etape,
  domaineId: 'm',
  demarcheTypeId: 'oct',
  titreTypeTypeId: 'pr',
  user: { role: 'admin', administrationId: 'ope-onf-973-01' },
  entreprises: [
    { id: newEntrepriseId('optionId1'), nom: 'optionNom1', etablissements: [] }
  ]
}
