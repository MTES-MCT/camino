import { Meta, StoryFn, StoryObj } from '@storybook/vue3'
import { EtapeDocumentsEdit } from './etape-documents-edit'
import { EtapeDocument, etapeDocumentIdValidator, etapeIdValidator } from 'camino-common/src/etape'
import { ApiClient } from '../../api/api-client'
import { action } from '@storybook/addon-actions'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { useArgs } from '@storybook/preview-api'

const meta: Meta = {
  title: 'Components/Etape/EtapeDocumentsEdit',
  // @ts-ignore
  component: EtapeDocumentsEdit,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const documents: EtapeDocument[] = [
  {
    id: etapeDocumentIdValidator.parse('id'),
    etape_document_type_id: 'dep',
    description: 'Une description',
    public_lecture: false,
    entreprises_lecture: false,
  },
  {
    id: etapeDocumentIdValidator.parse('id-car'),
    etape_document_type_id: 'car',
    description: 'Une description',
    public_lecture: false,
    entreprises_lecture: false,
  },
  {
    id: etapeDocumentIdValidator.parse('id2'),
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
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={[]}
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    etapeStatutId="fai"
    completeUpdate={completeUpdateAction}
    user={{ ...testBlankUser, role: 'super' }}
  />
)
export const Rempli: StoryFn = () => (
  <EtapeDocumentsEdit
    apiClient={apiClient}
    contenu={{}}
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={[]}
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    etapeStatutId="fai"
    completeUpdate={completeUpdateAction}
    user={{ ...testBlankUser, role: 'super' }}
  />
)

export const Complet: StoryFn = () => (
  <EtapeDocumentsEdit
    apiClient={{
      ...apiClient,
      getEtapeDocumentsByEtapeId: () =>
        Promise.resolve([
          {
            id: etapeDocumentIdValidator.parse('id'),
            etape_document_type_id: 'dep',
            description: 'Une description',
            public_lecture: false,
            entreprises_lecture: false,
          },
          {
            id: etapeDocumentIdValidator.parse('id2'),
            etape_document_type_id: 'dom',
            description: 'Une autre description',
            public_lecture: false,
            entreprises_lecture: false,
          },
          {
            id: etapeDocumentIdValidator.parse('id3'),
            etape_document_type_id: 'for',
            description: null,
            public_lecture: false,
            entreprises_lecture: false,
          },
          {
            id: etapeDocumentIdValidator.parse('id4'),
            etape_document_type_id: 'jpa',
            description: null,
            public_lecture: false,
            entreprises_lecture: false,
          },
          {
            id: etapeDocumentIdValidator.parse('id5'),
            etape_document_type_id: 'car',
            description: null,
            public_lecture: false,
            entreprises_lecture: false,
          },
        ]),
    }}
    contenu={{}}
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={[]}
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    etapeStatutId="fai"
    completeUpdate={completeUpdateAction}
    user={{ ...testBlankUser, role: 'super' }}
  />
)

export const ArmMecanise: StoryFn = () => (
  <EtapeDocumentsEdit
    apiClient={apiClient}
    contenu={{ arm: { mecanise: true } }}
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={[]}
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    etapeStatutId="fai"
    completeUpdate={completeUpdateAction}
    user={{ ...testBlankUser, role: 'super' }}
  />
)

export const ArmMecaniseDynamic: StoryObj<{ mecanise: boolean }> = {
  render: function Component(args: { mecanise: boolean }) {
    const [, setArgs] = useArgs()

    return () => (
      <>
        <button onClick={() => setArgs({ mecanise: !args.mecanise })}> Change la mécanisation </button>
        <EtapeDocumentsEdit
          apiClient={apiClient}
          contenu={{ arm: { mecanise: args.mecanise } }}
          etapeId={etapeIdValidator.parse('etapeId')}
          sdomZoneIds={[]}
          tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
          etapeStatutId="fai"
          completeUpdate={completeUpdateAction}
          user={{ ...testBlankUser, role: 'super' }}
        />
      </>
    )
  },
  args: {
    mecanise: true,
  },
}

export const EnConstruction: StoryFn = () => (
  <EtapeDocumentsEdit
    apiClient={apiClient}
    contenu={{ arm: { mecanise: true } }}
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={[]}
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    etapeStatutId="aco"
    completeUpdate={completeUpdateAction}
    user={{ ...testBlankUser, role: 'super' }}
  />
)

export const SdomZone: StoryFn = () => (
  <EtapeDocumentsEdit
    apiClient={apiClient}
    contenu={{ arm: { mecanise: true } }}
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={['1', '2']}
    tde={{ titreTypeId: 'axm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    etapeStatutId="fai"
    completeUpdate={completeUpdateAction}
    user={{ ...testBlankUser, role: 'super' }}
  />
)


export const PasDeDocumentsObligatoires: StoryFn = () => (
  <EtapeDocumentsEdit
    apiClient={apiClient}
    contenu={{}}
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={['1', '2']}
    tde={{ titreTypeId: 'prm', demarcheTypeId: 'pro', etapeTypeId: 'mfr' }}
    etapeStatutId="fai"
    completeUpdate={completeUpdateAction}
    user={{ ...testBlankUser, role: 'super' }}
  />
)


export const Loading: StoryFn = () => (
  <EtapeDocumentsEdit
    apiClient={{ ...apiClient, getEtapeDocumentsByEtapeId: () => new Promise(() => ({})) }}
    contenu={{}}
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={[]}
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    etapeStatutId="fai"
    completeUpdate={completeUpdateAction}
    user={{ ...testBlankUser, role: 'super' }}
  />
)
export const WithError: StoryFn = () => (
  <EtapeDocumentsEdit
    apiClient={{ ...apiClient, getEtapeDocumentsByEtapeId: () => Promise.reject(new Error('Une erreur est survenue')) }}
    contenu={{}}
    etapeId={etapeIdValidator.parse('etapeId')}
    sdomZoneIds={[]}
    tde={{ titreTypeId: 'arm', demarcheTypeId: 'oct', etapeTypeId: 'mfr' }}
    etapeStatutId="fai"
    completeUpdate={completeUpdateAction}
    user={{ ...testBlankUser, role: 'super' }}
  />
)
