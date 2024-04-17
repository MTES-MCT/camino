import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { ApiClient } from '@/api/api-client'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { AddEtapeDaeDocumentPopup } from './add-etape-dae-document-popup'
import { toCaminoDate } from 'camino-common/src/date'
import { etapeDocumentIdValidator } from 'camino-common/src/etape'

const meta: Meta = {
  title: 'Components/Etape/Document/AjoutDocumentPourDae',
  // @ts-ignore
  component: AddEtapeDaeDocumentPopup,
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
  <AddEtapeDaeDocumentPopup close={close} apiClient={apiClient} initialDocument={null} />
)

export const DocumentInitialTemporaire: StoryFn = () => (
  <AddEtapeDaeDocumentPopup
    close={close}
    initialDocument={{ description: 'description', entreprises_lecture: true, public_lecture: false, etape_document_type_id: 'arp', temp_document_name: tempDocumentNameValidator.parse('value'), arretePrefectoral: 'toto', date: toCaminoDate('2023-01-02'), etapeStatutId: 'exe' }}
    apiClient={apiClient}
  />
)

export const DocumentInitialDejaSauvegarde: StoryFn = () => (
  <AddEtapeDaeDocumentPopup
    close={close}
    initialDocument={{ description: 'description', entreprises_lecture: true, public_lecture: false, etape_document_type_id: 'arp', id: etapeDocumentIdValidator.parse('documentId'), arretePrefectoral: 'toto', date: toCaminoDate('2023-01-02'), etapeStatutId: 'req' }}
    apiClient={apiClient}
  />
)
