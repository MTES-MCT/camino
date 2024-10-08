import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { AddEtapeDocumentPopup } from './add-etape-document-popup'
import { ApiClient } from '@/api/api-client'
import { testBlankUser } from 'camino-common/src/tests-utils'

const meta: Meta = {
  title: 'Components/Etape/Document/Ajout',
  // @ts-ignore
  component: AddEtapeDocumentPopup,
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
export const Default: StoryFn = () => (
  <AddEtapeDocumentPopup close={close} documentTypeIds={['car', 'doe', 'jpa', 'aut']} user={{ ...testBlankUser, role: 'admin', administrationId: 'aut-97300-01' }} apiClient={apiClient} />
)

export const Entreprise: StoryFn = () => (
  <AddEtapeDocumentPopup close={close} documentTypeIds={['car', 'doe', 'jpa']} user={{ ...testBlankUser, role: 'entreprise', entrepriseIds: [] }} apiClient={apiClient} />
)

export const UnSeulDocumentPossible: StoryFn = () => (
  <AddEtapeDocumentPopup close={close} documentTypeIds={['car']} user={{ ...testBlankUser, role: 'entreprise', entrepriseIds: [] }} apiClient={apiClient} />
)

export const DocumentInitial: StoryFn = () => (
  <AddEtapeDocumentPopup
    close={close}
    documentTypeIds={['car']}
    initialDocument={{ description: 'description', entreprises_lecture: true, public_lecture: false, etape_document_type_id: 'car', temp_document_name: tempDocumentNameValidator.parse('value') }}
    user={{ ...testBlankUser, role: 'super' }}
    apiClient={apiClient}
  />
)

export const DocumentInitialAutre: StoryFn = () => (
  <AddEtapeDocumentPopup
    close={close}
    documentTypeIds={['aut']}
    initialDocument={{ description: 'description', entreprises_lecture: true, public_lecture: false, etape_document_type_id: 'aut', temp_document_name: tempDocumentNameValidator.parse('value') }}
    user={{ ...testBlankUser, role: 'super' }}
    apiClient={apiClient}
  />
)
