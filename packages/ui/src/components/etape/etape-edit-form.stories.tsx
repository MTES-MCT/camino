import { EtapeEditForm, Props } from './etape-edit-form'
import { Meta, StoryFn } from '@storybook/vue3'
import { EtapeFondamentale, EtapeId, etapeIdValidator } from 'camino-common/src/etape'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { action } from '@storybook/addon-actions'
import { DemarcheId, demarcheIdValidator } from 'camino-common/src/demarche'
import { ApiClient } from '@/api/api-client'
import { titreSlugValidator } from 'camino-common/src/validators/titres'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { DeepReadonly } from 'vue'

const meta: Meta = {
  title: 'Components/Etape/Edition',
  // @ts-ignore
  component: EtapeEditForm,
  argTypes: {},
}
export default meta


const heritageProps: EtapeFondamentale['heritageProps'] = {
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
}
const etape: DeepReadonly<EtapeFondamentale> = {
  id: etapeIdValidator.parse('id'),
  statutId: 'fai',
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
  heritageProps,
  heritageContenu: {}
}

const completeUpdate = action('completeUpdate')
const alertesUpdate = action('alertesUpdate')
const getEtapesTypesEtapesStatutsAction = action('getEtapesTypesEtapesStatuts')
const getEtapeHeritageAction = action('getEtapeHeritage')
const apiClient: Props['apiClient'] = {
  getEntrepriseDocuments() {
    return Promise.resolve([])
  },
  getEtapesTypesEtapesStatuts(demarcheId: DemarcheId, titreEtapeId: EtapeId | null, date: CaminoDate) {
    getEtapesTypesEtapesStatutsAction(demarcheId, titreEtapeId, date)
    return Promise.resolve([
      {etapeTypeId: 'mfr', etapeStatutId: 'fai', mainStep: true},
      {etapeTypeId: 'mfr', etapeStatutId: 'aco', mainStep: true},
      {etapeTypeId: 'mdp', etapeStatutId: 'fai', mainStep: true},
    ])
  },
  getEtapeHeritage(titreDemarcheId: DemarcheId, date: CaminoDate, typeId: EtapeTypeId) {
    getEtapeHeritageAction(titreDemarcheId, date, typeId)
    return Promise.resolve({
heritageContenu: {},
heritageProps
    })
  }
}

export const Default: StoryFn = () => <EtapeEditForm 
    alertesUpdate={alertesUpdate}
    apiClient={apiClient}
    demarcheId={demarcheIdValidator.parse('demarcheId')}
    demarcheTypeId='oct'
    titreSlug={titreSlugValidator.parse('titre-slug')}
    titreTypeId='axm'
    sdomZoneIds={[]}
    etape={etape}
    etapeIsDemandeEnConstruction={false}
    completeUpdate={completeUpdate}
    user= {{
      role: 'super',
      ...testBlankUser,
    }}
    entreprises={[
      {
        id: newEntrepriseId('optionId1'),
        nom: 'optionNom1',
        legal_siren: null,
      }
    ]}
/>

// FIXME tests avec
// - heritageContenu
// - 