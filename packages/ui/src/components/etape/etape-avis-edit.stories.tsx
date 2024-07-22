import { Meta, StoryFn } from '@storybook/vue3'
import { EtapeAvisEdit } from './etape-avis-edit'
import { EtapeAvis, etapeAvisIdValidator, etapeIdValidator } from 'camino-common/src/etape'
import { ApiClient } from '../../api/api-client'
import { action } from '@storybook/addon-actions'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { caminoDateValidator } from 'camino-common/src/date'
import { AvisVisibilityIds } from 'camino-common/src/static/avisTypes'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { communeIdValidator } from 'camino-common/src/static/communes'

const meta: Meta = {
  title: 'Components/Etape/EtapeAvisEdit',
  // @ts-ignore
  component: EtapeAvisEdit,
  decorators: [(): { template: string } => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const avis: EtapeAvis[] = [
  {
    id: etapeAvisIdValidator.parse('id'),
    avis_type_id: 'confirmationAccordProprietaireDuSol',
    description: 'Une description',
    date: caminoDateValidator.parse('2023-02-01'),
    avis_statut_id: 'Favorable',
    has_file: false,
    avis_visibility_id: AvisVisibilityIds.Administrations,
  },
  {
    id: etapeAvisIdValidator.parse('id-car'),
    avis_type_id: 'autreAvis',
    description: 'Une description',
    date: caminoDateValidator.parse('2023-02-01'),
    avis_statut_id: 'Non renseigné',
    has_file: false,
    avis_visibility_id: AvisVisibilityIds.Public,
  },
]

const uploadTempDocumentAction = action('uploadTempDocument')
const getEtapeAvisByEtapeIdAction = action('getEtapeAvisByEtapeId')

const apiClient: Pick<ApiClient, 'uploadTempDocument' | 'getEtapeAvisByEtapeId'> = {
  getEtapeAvisByEtapeId: etapeId => {
    getEtapeAvisByEtapeIdAction(etapeId)

    return Promise.resolve(avis)
  },
  uploadTempDocument: document => {
    uploadTempDocumentAction(document)

    return Promise.resolve(tempDocumentNameValidator.parse(new Date().toISOString()))
  },
}

const completeUpdateAction = action('completeUpdate')

export const Empty: StoryFn = () => (
  <EtapeAvisEdit
    apiClient={{ ...apiClient, getEtapeAvisByEtapeId: () => Promise.resolve([]) }}
    etapeId={etapeIdValidator.parse('etapeId')}
    communeIds={[]}
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    onChange={completeUpdateAction}
    user={{ ...testBlankUser, role: 'super' }}
  />
)
export const Rempli: StoryFn = () => (
  <EtapeAvisEdit
    apiClient={apiClient}
    etapeId={etapeIdValidator.parse('etapeId')}
    communeIds={[]}
    tde={{ titreTypeId: 'axm', demarcheTypeId: 'oct', etapeTypeId: 'asc' }}
    onChange={completeUpdateAction}
    user={{ ...testBlankUser, role: 'super' }}
  />
)
export const AvisEnGuyane: StoryFn = () => (
  <EtapeAvisEdit
    apiClient={{
      ...apiClient,
      getEtapeAvisByEtapeId: async () => {
        return Promise.resolve([
          ...avis,
          {
            id: etapeAvisIdValidator.parse('id-guyane'),
            avis_type_id: 'avisDirectionAlimentationAgricultureForet',
            description: 'Visible que en Guyane',
            date: caminoDateValidator.parse('2023-02-01'),
            avis_statut_id: 'Non renseigné',
            has_file: false,
            avis_visibility_id: AvisVisibilityIds.Public,
          },
        ])
      },
    }}
    etapeId={etapeIdValidator.parse('etapeId')}
    communeIds={[communeIdValidator.parse('97302')]}
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'asc' }}
    onChange={completeUpdateAction}
    user={{ ...testBlankUser, role: 'super' }}
  />
)
