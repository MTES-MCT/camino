import { Meta, StoryFn } from '@storybook/vue3'
import { documentIdValidator } from 'camino-common/src/entreprise'
import { EtapeDocumentsEdit } from './etape-documents-edit'
import { EtapeDocument, etapeIdValidator } from 'camino-common/src/etape'
import { ApiClient } from '../../api/api-client'
import { action } from '@storybook/addon-actions'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { caminoDateValidator } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Etape/EtapeDocumentsEdit',
  // @ts-ignore
  component: EtapeDocumentsEdit,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const documents: EtapeDocument[] = [
  {
    id: documentIdValidator.parse('id'),
    etape_document_type_id: 'dep',
    description: 'Une description',
    public_lecture: false,
    entreprises_lecture: false,
  },
  {
    id: documentIdValidator.parse('id-car'),
    etape_document_type_id: 'car',
    description: 'Une description',
    public_lecture: false,
    entreprises_lecture: false,
  },
  {
    id: documentIdValidator.parse('id2'),
    etape_document_type_id: 'doe',
    description: null,
    public_lecture: true,
    entreprises_lecture: true,
  },
]

const uploadTempDocumentAction = action('uploadTempDocument')

const apiClient: Pick<ApiClient, 'uploadTempDocument' | 'getEtapeDocumentsByEtapeId'> = {
  getEtapeDocumentsByEtapeId: () => Promise.resolve(documents),
  uploadTempDocument: document => {
    uploadTempDocumentAction(document)

    return Promise.resolve(tempDocumentNameValidator.parse(new Date().toISOString()))
  },
}

const completeUpdateAction = action('completeUpdate')

export const Empty: StoryFn = () => (
  <EtapeDocumentsEdit
    apiClient={{ ...apiClient, getEtapeDocumentsByEtapeId: () => Promise.resolve([]) }}
    contenu={{}}
    etapeDate={caminoDateValidator.parse('2023-02-03')}
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={[]}
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    etapeStatutId="fai"
    completeUpdate={completeUpdateAction}
  />
)
export const Rempli: StoryFn = () => (
  <EtapeDocumentsEdit
    apiClient={apiClient}
    contenu={{}}
    etapeDate={caminoDateValidator.parse('2023-02-03')}
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={[]}
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    etapeStatutId="fai"
    completeUpdate={completeUpdateAction}
  />
)

export const Complet: StoryFn = () => (
  <EtapeDocumentsEdit
  apiClient={{ ...apiClient, getEtapeDocumentsByEtapeId: () => Promise.resolve([{
    id: documentIdValidator.parse('id'),
    etape_document_type_id: 'dep',
    description: 'Une description',
    public_lecture: false,
    entreprises_lecture: false,
  },
  {
    id: documentIdValidator.parse('id2'),
    etape_document_type_id: 'dom',
    description: 'Une autre description',
    public_lecture: false,
    entreprises_lecture: false,
  },
  {
    id: documentIdValidator.parse('id3'),
    etape_document_type_id: 'for',
    description: null,
    public_lecture: false,
    entreprises_lecture: false,
  },
  {
    id: documentIdValidator.parse('id4'),
    etape_document_type_id: 'jpa',
    description: null,
    public_lecture: false,
    entreprises_lecture: false,
  },
  {
    id: documentIdValidator.parse('id5'),
    etape_document_type_id: 'car',
    description: null,
    public_lecture: false,
    entreprises_lecture: false,
  }

]) }}
  contenu={{}}
    etapeDate={caminoDateValidator.parse('2023-02-03')}
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={[]}
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    etapeStatutId="fai"
    completeUpdate={completeUpdateAction}
  />
)


export const ArmMecanise: StoryFn = () => (
  <EtapeDocumentsEdit
    apiClient={apiClient}
    contenu={{ arm: { mecanise: true } }}
    etapeDate={caminoDateValidator.parse('2023-02-03')}
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={[]}
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    etapeStatutId="fai"
    completeUpdate={completeUpdateAction}
  />
)

export const EnConstruction: StoryFn = () => (
  <EtapeDocumentsEdit
    apiClient={apiClient}
    contenu={{ arm: { mecanise: true } }}
    etapeDate={caminoDateValidator.parse('2023-02-03')}
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={[]}
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    etapeStatutId="aco"
    completeUpdate={completeUpdateAction}
  />
)

export const SdomZone: StoryFn = () => (
  <EtapeDocumentsEdit
    apiClient={apiClient}
    contenu={{ arm: { mecanise: true } }}
    etapeDate={caminoDateValidator.parse('2023-02-03')}
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={['1', '2']}
    tde={{ titreTypeId: 'axm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    etapeStatutId="fai"
    completeUpdate={completeUpdateAction}
  />
)

export const Loading: StoryFn = () => (
  <EtapeDocumentsEdit
    apiClient={{ ...apiClient, getEtapeDocumentsByEtapeId: () => new Promise(() => ({})) }}
    contenu={{}}
    etapeDate={caminoDateValidator.parse('2023-02-03')}
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={[]}
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    etapeStatutId="fai"
    completeUpdate={completeUpdateAction}
  />
)
export const WithError: StoryFn = () => (
  <EtapeDocumentsEdit
    apiClient={{ ...apiClient, getEtapeDocumentsByEtapeId: () => Promise.reject(new Error('Une erreur est survenue')) }}
    contenu={{}}
    etapeDate={caminoDateValidator.parse('2023-02-03')}
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={[]}
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    etapeStatutId="fai"
    completeUpdate={completeUpdateAction}
  />
)
