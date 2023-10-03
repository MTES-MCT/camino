import { ActiviteDocumentsEdit } from './activite-documents-edit'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { activiteDocumentIdValidator } from 'camino-common/src/activite'
import { ApiClient } from '@/api/api-client'
import { ACTIVITES_TYPES_IDS } from 'camino-common/src/static/activitesTypes'
import { activitesTypesDocumentsTypes } from 'camino-common/src/static/activitesTypesDocumentsTypes'

const meta: Meta = {
  title: 'Components/Activite/ActiviteDocumentsEdit',
  component: ActiviteDocumentsEdit,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const uploadTempDocumentAction = action('uploadTempDocument')
const completeUpdateAction = action('completeUpdate')

const apiClient: Pick<ApiClient, 'uploadTempDocument'> = {
  uploadTempDocument: (...params: unknown[]) => {
    uploadTempDocumentAction(params)

    return Promise.resolve(tempDocumentNameValidator.parse(new Date().toISOString()))
  },
}
export const AvecDesDocumentsDejaPresents: StoryFn = () => (
  <ActiviteDocumentsEdit
    activiteTypeId={ACTIVITES_TYPES_IDS["rapport environnemental d'exploration"]}
    activiteDocuments={[
      {
        activite_document_type_id: activitesTypesDocumentsTypes[ACTIVITES_TYPES_IDS["rapport environnemental d'exploration"]][0].documentTypeId,
        description: 'description',
        id: activiteDocumentIdValidator.parse('id1'),
      },
    ]}
    completeUpdate={completeUpdateAction}
    apiClient={apiClient}
  />
)

export const DocumentObligatoire: StoryFn = () => <ActiviteDocumentsEdit activiteTypeId="wrp" activiteDocuments={[]} completeUpdate={completeUpdateAction} apiClient={apiClient} />
