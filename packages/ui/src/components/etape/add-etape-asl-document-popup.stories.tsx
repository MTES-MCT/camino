import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { ApiClient } from '@/api/api-client'
import { AddEtapeAslDocumentPopup } from './add-etape-asl-document-popup'
import { toCaminoDate } from 'camino-common/src/date'
import { etapeDocumentIdValidator } from 'camino-common/src/etape'

const meta: Meta = {
  title: 'Components/Etape/Document/AjoutDocumentPourAsl',
  // @ts-ignore
  component: AddEtapeAslDocumentPopup,
}
export default meta

const close = action('close')
const uploadTempDocumentAction = action('uploadTempDocument')

const apiClient: Pick<ApiClient, 'uploadTempDocument'> = {
  uploadTempDocument: (...params) => {
    uploadTempDocumentAction(params)

    return Promise.resolve(tempDocumentNameValidator.parse(new Date().toISOString()))
  },
}

export const SansDocumentInitial: StoryFn = () => (
  <AddEtapeAslDocumentPopup close={close} apiClient={apiClient} initialDocument={null} />
)

export const DocumentInitialTemporaire: StoryFn = () => (
  <AddEtapeAslDocumentPopup
    close={close}
    initialDocument={{ description: 'description', entreprises_lecture: true, public_lecture: false, etape_document_type_id: 'let', temp_document_name: tempDocumentNameValidator.parse('value'), date: toCaminoDate('2023-01-02'), etape_statut_id: 'exe' }}
    apiClient={apiClient}
  />
)

export const DocumentInitialDejaSauvegarde: StoryFn = () => (
  <AddEtapeAslDocumentPopup
    close={close}
    initialDocument={{ description: 'description', entreprises_lecture: true, public_lecture: false, etape_document_type_id: 'let', id: etapeDocumentIdValidator.parse('documentId'), date: toCaminoDate('2023-01-02'), etape_statut_id: 'req' }}
    apiClient={apiClient}
  />
)
