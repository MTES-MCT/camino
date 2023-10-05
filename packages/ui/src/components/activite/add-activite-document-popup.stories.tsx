import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { AddActiviteDocumentPopup } from './add-activite-document-popup'
import { ApiClient } from '@/api/api-client'
import { ACTIVITES_TYPES_IDS } from 'camino-common/src/static/activitesTypes'

const meta: Meta = {
  title: 'Components/Activite/Document/Ajout',
  component: AddActiviteDocumentPopup,
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
export const DocumentObligatoire: StoryFn = () => (
  <AddActiviteDocumentPopup close={close} activiteTypeId={ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions M)"]} apiClient={apiClient} />
)
export const DocumentOptionnel: StoryFn = () => <AddActiviteDocumentPopup close={close} activiteTypeId={ACTIVITES_TYPES_IDS["rapport environnemental d'exploration"]} apiClient={apiClient} />
export const PasDeDocument: StoryFn = () => <AddActiviteDocumentPopup close={close} activiteTypeId={ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"]} apiClient={apiClient} />
