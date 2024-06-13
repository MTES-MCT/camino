import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { ApiClient } from '@/api/api-client'
import { AddEtapeAvisPopup } from './add-etape-avis-popup'
import { toCaminoDate } from 'camino-common/src/date'
import { etapeAvisIdValidator } from 'camino-common/src/etape'
import { AvisTypeId, AvisTypes, avisTypeIdValidator } from 'camino-common/src/static/avisTypes'
import { NonEmptyArray, getKeys } from 'camino-common/src/typescript-tools'

const meta: Meta = {
  title: 'Components/Etape/AddAvisPopup',
  // @ts-ignore
  component: AddEtapeAvisPopup,
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
const avisTypeIds: NonEmptyArray<AvisTypeId> = getKeys(AvisTypes, (value): value is AvisTypeId => {
  return avisTypeIdValidator.safeParse(value).success
}) as NonEmptyArray<AvisTypeId>
export const SansDocumentInitial: StoryFn = () => <AddEtapeAvisPopup close={close} apiClient={apiClient} initialAvis={null} avisTypeIds={avisTypeIds} />

export const DocumentInitialTemporaire: StoryFn = () => (
  <AddEtapeAvisPopup
    close={close}
    initialAvis={{
      description: 'description',
      avis_type_id: 'lettreDeSaisineDesServices',
      temp_document_name: tempDocumentNameValidator.parse('value'),
      date: toCaminoDate('2023-01-02'),
      avis_statut_id: 'Favorable',
      has_file: false,
    }}
    apiClient={apiClient}
    avisTypeIds={avisTypeIds}
  />
)

export const DocumentInitialDejaSauvegarde: StoryFn = () => (
  <AddEtapeAvisPopup
    close={close}
    initialAvis={{
      description: 'description',
      avis_type_id: 'lettreDeSaisineDesServices',
      id: etapeAvisIdValidator.parse('documentId'),
      date: toCaminoDate('2023-01-02'),
      avis_statut_id: 'Favorable',
      has_file: false,
    }}
    apiClient={apiClient}
    avisTypeIds={avisTypeIds}
  />
)
