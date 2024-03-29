import { FondamentalesEdit, Props } from './fondamentales-edit'
import { Meta, StoryFn } from '@storybook/vue3'
import { EtapeFondamentale, etapeIdValidator } from 'camino-common/src/etape'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { toCaminoDate } from 'camino-common/src/date'
import { testBlankUser } from 'camino-common/src/tests-utils'

const meta: Meta = {
  title: 'Components/Etape/FondamentalesEdit',
  component: FondamentalesEdit,
  argTypes: {},
}
export default meta

const etape: EtapeFondamentale = {
  id: etapeIdValidator.parse('id'),
  typeId: 'mfr',
  contenu: {},
  date: toCaminoDate('2022-02-02'),
  dateDebut: toCaminoDate('2022-02-02'),
  dateFin: undefined,
  duree: 4,
  substances: ['arse'],
  titulaires: [{ id: newEntrepriseId('optionId1'), operateur: true }],
  amodiataires: [],
  notes: null,
  heritageProps: {
    dateDebut: {
      actif: false,
    },
    dateFin: {
      actif: false,
    },
    duree: {
      actif: false,
    },
    substances: {
      actif: true,
      etape: {
        date: toCaminoDate('2022-01-01'),
        typeId: 'mfr',
        substances: ['arge'],
        titulaires: [],
        amodiataires: [],
        dateDebut: null,
        dateFin: undefined,
        duree: undefined,
      },
    },
    titulaires: {
      actif: false,
    },
    amodiataires: {
      actif: false,
    },
    perimetre: {
      actif: false,
    },
  },
}
const Template: StoryFn<Props> = (args: Props) => ({
  components: { FondamentalesEdit },
  setup() {
    return { args }
  },
  data: () => ({ etapeData: {} }),
  watch: {
    args: {
      handler: function (newValue) {
        this.etapeData = newValue.etape
      },
      immediate: true,
    },
  },
  template: '<FondamentalesEdit v-bind="args" :etape="etapeData"/>',
})

export const ArmDemandeONF = Template.bind(
  {},
  {
    etape,
    demarcheTypeId: 'oct',
    titreTypeId: 'arm',
    user: {
      role: 'admin',
      administrationId: 'ope-onf-973-01',
      ...testBlankUser,
    },
    entreprises: [
      {
        id: newEntrepriseId('optionId1'),
        nom: 'optionNom1',
        legal_siren: null,
      },
    ],
  }
)

export const ArmDemandeOperateur = Template.bind(
  {},
  {
    etape,
    demarcheTypeId: 'oct',
    titreTypeId: 'arm',
    user: { role: 'entreprise', entreprises: [], ...testBlankUser },
    entreprises: [
      {
        id: newEntrepriseId('optionId1'),
        nom: 'optionNom1',
        legal_siren: null,
      },
    ],
  }
)

export const ArmJorfONF = Template.bind(
  {},
  {
    etape: { ...etape, typeId: 'dpu' },
    demarcheTypeId: 'oct',
    titreTypeId: 'arm',
    user: {
      role: 'admin',
      administrationId: 'ope-onf-973-01',
      ...testBlankUser,
    },
    entreprises: [
      {
        id: newEntrepriseId('optionId1'),
        nom: 'optionNom1',
        legal_siren: null,
      },
    ],
  }
)

export const AxmDemandeONF = Template.bind(
  {},
  {
    etape,
    demarcheTypeId: 'oct',
    titreTypeId: 'axm',
    user: {
      role: 'admin',
      administrationId: 'ope-onf-973-01',
      ...testBlankUser,
    },
    entreprises: [
      {
        id: newEntrepriseId('optionId1'),
        nom: 'optionNom1',
        legal_siren: null,
      },
    ],
  }
)

export const PrmDemandeONF = Template.bind(
  {},
  {
    etape,
    demarcheTypeId: 'oct',
    titreTypeId: 'prm',
    user: {
      role: 'admin',
      administrationId: 'ope-onf-973-01',
      ...testBlankUser,
    },
    entreprises: [
      {
        id: newEntrepriseId('optionId1'),
        nom: 'optionNom1',
        legal_siren: null,
      },
    ],
  }
)

export const PrmDeplacementDePerimetreONF = Template.bind(
  {},
  {
    etape,
    demarcheTypeId: 'dep',
    titreTypeId: 'prm',
    user: {
      role: 'admin',
      administrationId: 'ope-onf-973-01',
      ...testBlankUser,
    },
    entreprises: [
      {
        id: newEntrepriseId('optionId1'),
        nom: 'optionNom1',
        legal_siren: null,
      },
    ],
  }
)
