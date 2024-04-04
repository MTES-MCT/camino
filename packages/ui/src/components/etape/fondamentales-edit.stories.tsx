import { FondamentalesEdit } from './fondamentales-edit'
import { Meta, StoryFn } from '@storybook/vue3'
import { FullEtapeHeritage, etapeIdValidator } from 'camino-common/src/etape'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { toCaminoDate } from 'camino-common/src/date'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Etape/FondamentalesEdit',
  component: FondamentalesEdit,
  argTypes: {},
}
export default meta

const etape: FullEtapeHeritage = {
  id: etapeIdValidator.parse('id'),
  heritageContenu: {},
  statutId: 'aco',
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
  geojson4326Forages: undefined,
  geojson4326Perimetre: undefined,
  geojson4326Points: undefined,
  surface: undefined,
  geojsonOriginePerimetre: undefined,
  geojsonOriginePoints: undefined,
  geojsonOrigineGeoSystemeId: undefined,
  geojsonOrigineForages: undefined,
  heritageProps: {
    dateDebut: {
      actif: false,
    },
    dateFin: {
      actif: false,
    },
    duree: {
      actif: false,
      etape: {
        date: toCaminoDate('2022-01-01'),
        typeId: 'mfr',
        duree: 12,
      },
    },
    substances: {
      actif: true,
      etape: {
        date: toCaminoDate('2022-01-01'),
        typeId: 'mfr',
        substances: ['arge'],
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

const entreprises = [
  {
    id: newEntrepriseId('optionId1'),
    nom: 'optionNom1',
    legal_siren: null,
  },
  {
    id: newEntrepriseId('optionId2'),
    nom: 'optionNom2',
    legal_siren: null,
  },
  {
    id: newEntrepriseId('optionId3'),
    nom: 'optionNom3',
    legal_siren: null,
  }
]

const completeUpdate = action('completeUpdate')

export const AxmDemandeSuper: StoryFn = () => <FondamentalesEdit
    etape={etape}
    completeUpdate={completeUpdate}
    demarcheTypeId='oct'
    titreTypeId='axm'
    user= {{
      role: 'super',
      ...testBlankUser,
    }}
    entreprises={entreprises}
/>


export const ArmDemandeONF: StoryFn = () => <FondamentalesEdit
    etape={etape}
    completeUpdate={completeUpdate}
    demarcheTypeId='oct'
    titreTypeId='arm'
    user= {{
      role: 'admin',
      administrationId: 'ope-onf-973-01',
      ...testBlankUser,
    }}
    entreprises={entreprises}
/>

export const ArmDemandeOperateur: StoryFn = () => <FondamentalesEdit
    etape={etape}
    completeUpdate={completeUpdate}
    demarcheTypeId='oct'
    titreTypeId='arm'
    user= {{ role: 'entreprise', entreprises: [], ...testBlankUser }}
    entreprises={entreprises}
/>

export const ArmJorfONF: StoryFn = () => <FondamentalesEdit
    etape={{ ...etape, typeId: 'dpu' }}
    completeUpdate={completeUpdate}
    demarcheTypeId='oct'
    titreTypeId='arm'
    user= {{ role: 'admin', administrationId: 'ope-onf-973-01', ...testBlankUser }}
    entreprises={entreprises}
/>



export const AxmDemandeONF: StoryFn = () => <FondamentalesEdit
    etape={etape}
    completeUpdate={completeUpdate}
    demarcheTypeId='oct'
    titreTypeId='axm'
    user= {{ role: 'admin', administrationId: 'ope-onf-973-01', ...testBlankUser }}
    entreprises={entreprises}
/>

export const PrmDemandeONF: StoryFn = () => <FondamentalesEdit
    etape={etape}
    completeUpdate={completeUpdate}
    demarcheTypeId='oct'
    titreTypeId='prm'
    user= {{ role: 'admin', administrationId: 'ope-onf-973-01', ...testBlankUser }}
    entreprises={entreprises}
/>

export const PrmDeplacementDePerimetreONF: StoryFn = () => <FondamentalesEdit
    etape={etape}
    completeUpdate={completeUpdate}
    demarcheTypeId='dep'
    titreTypeId='prm'
    user= {{ role: 'admin', administrationId: 'ope-onf-973-01', ...testBlankUser }}
    entreprises={entreprises}
/>
