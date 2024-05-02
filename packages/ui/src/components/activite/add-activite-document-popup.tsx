import { updateFromEvent } from '@/utils/vue-tsx-utils'
import { computed, defineComponent, ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { ActiviteDocumentTypeIds, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { InputFile } from '../_ui/dsfr-input-file'
import { ApiClient } from '@/api/api-client'
import { ActivitesTypes, ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { activitesTypesDocumentsTypes } from 'camino-common/src/static/activitesTypesDocumentsTypes'
import { TempActiviteDocument, tempActiviteDocumentValidator } from 'camino-common/src/activite'
import { TempDocumentName } from 'camino-common/src/document'
import { Nullable } from 'camino-common/src/typescript-tools'
import { DsfrInput } from '../_ui/dsfr-input'

interface Props {
  close: (document: TempActiviteDocument | null) => void
  activiteTypeId: ActivitesTypesId
  apiClient: Pick<ApiClient, 'uploadTempDocument'>
}

export const AddActiviteDocumentPopup = defineComponent<Props>(props => {
  const activiteDocumentTypes = activitesTypesDocumentsTypes[props.activiteTypeId].map(({ documentTypeId }) => documentTypeId)
  const activiteDocumentTypeId = ref<(typeof ActiviteDocumentTypeIds)[number] | null>(activiteDocumentTypes.length === 1 ? activiteDocumentTypes[0] : null)
  const activiteDocumentFile = ref<File | null>(null)
  const documentDescription = ref<string>('')
  const tempDocumentName = ref<TempDocumentName | null>(null)

  const descriptionChange = (value: string) => {
    documentDescription.value = value
  }
  const content = () => (
    <form>
      {activiteDocumentTypes.length === 1 ? null : (
        <fieldset class="fr-fieldset" id="text">
          <div class="fr-fieldset__element">
            <div class="fr-select-group">
              <label class="fr-label" for="type">
                Type de document
              </label>
              <select class="fr-select" name="type" onChange={e => updateFromEvent(e, activiteDocumentTypeId)}>
                <option value="" selected disabled hidden>
                  Selectionnez un type de document
                </option>
                {activiteDocumentTypes.map(id => {
                  return <option value={id}>{DocumentsTypes[id].nom}</option>
                })}
              </select>
            </div>
          </div>
        </fieldset>
      )}

      <fieldset class="fr-fieldset" id="text">
        <div class="fr-fieldset__element">
          <InputFile
            accept={['pdf']}
            uploadFile={file => {
              activiteDocumentFile.value = file
            }}
          />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInput legend={{ main: 'Description' }} initialValue={documentDescription.value} type={{ type: 'text' }} valueChanged={descriptionChange} />
        </div>
      </fieldset>
    </form>
  )

  const canSave = computed<boolean>(() => {
    const tempDocument: Omit<Nullable<TempActiviteDocument>, 'tempDocumentName'> = {
      activite_document_type_id: activiteDocumentTypeId.value,
      description: documentDescription.value,
    }

    return tempActiviteDocumentValidator.omit({ tempDocumentName: true }).safeParse(tempDocument).success && activiteDocumentFile.value !== null
  })

  return () => (
    <>
      {activiteDocumentTypes.length === 0 ? (
        <>{`L'activité ${ActivitesTypes[props.activiteTypeId].nom} n'a pas de documents associés, impossible d'ajouter des documents`}</>
      ) : (
        <FunctionalPopup
          title={activiteDocumentTypes.length === 1 ? `Ajouter ${DocumentsTypes[activiteDocumentTypes[0]].nom}` : "Ajout d'un document"}
          content={content}
          close={() => {
            const tempDocument: Nullable<TempActiviteDocument> = {
              activite_document_type_id: activiteDocumentTypeId.value,
              description: documentDescription.value,
              tempDocumentName: tempDocumentName.value,
            }
            const parsed = tempActiviteDocumentValidator.safeParse(tempDocument)

            if (parsed.success) {
              props.close(parsed.data)
            } else {
              props.close(null)
            }
          }}
          validate={{
            action: async () => {
              if (activiteDocumentFile.value !== null) {
                tempDocumentName.value = await props.apiClient.uploadTempDocument(activiteDocumentFile.value)
              }
            },
          }}
          canValidate={canSave.value}
        />
      )}
    </>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
AddActiviteDocumentPopup.props = ['close', 'apiClient', 'activiteTypeId']
