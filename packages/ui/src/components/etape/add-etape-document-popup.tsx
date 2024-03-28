import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { computed, ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { DocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { InputFile } from '../_ui/dsfr-input-file'
import { ApiClient } from '@/api/api-client'
import { TempDocumentName } from 'camino-common/src/document'
import { NonEmptyArray, Nullable, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { DsfrInput } from '../_ui/dsfr-input'
import { EtapeDocumentModification, TempEtapeDocument, etapeDocumentModificationValidator, tempEtapeDocumentValidator } from 'camino-common/src/etape'
import { DsfrInputRadio } from '../_ui/dsfr-input-radio'
import { VisibilityLabel } from './etape-documents'
import { isEntrepriseOrBureauDEtude, User } from 'camino-common/src/roles'
import { DocumentTypeTypeahead } from '../_common/document-type-typeahead'

interface Props {
  close: (document: EtapeDocumentModification | null) => void
  documentTypeIds: NonEmptyArray<DocumentTypeId>
  initialDocument?: EtapeDocumentModification
  apiClient: Pick<ApiClient, 'uploadTempDocument'>
  user: User
}

type DocumentVisibility = (typeof visibility)[number]

const visibility = ['administrations', 'entreprises', 'public'] as const

export const AddEtapeDocumentPopup = caminoDefineComponent<Props>(['close', 'apiClient', 'documentTypeIds', 'user', 'initialDocument'], props => {
  const etapeDocumentTypeId = ref<DocumentTypeId | null>(props.documentTypeIds.length === 1 ? props.documentTypeIds[0] : null)
  const etapeDocumentFile = ref<File | null>(null)
  const documentDescription = ref<string>(props.initialDocument?.description ?? '')
  const tempDocumentName = ref<TempDocumentName | undefined>(
    isNotNullNorUndefined(props.initialDocument) && 'temp_document_name' in props.initialDocument ? props.initialDocument.temp_document_name : undefined
  )

  const etapeDocumentVisibility = ref<DocumentVisibility | null>(
    isNotNullNorUndefined(props.initialDocument) ? (props.initialDocument.public_lecture ? 'public' : props.initialDocument.entreprises_lecture ? 'entreprises' : 'administrations') : null
  )

  const descriptionChange = (value: string) => {
    documentDescription.value = value
  }

  const visibilityChange = (value: DocumentVisibility) => {
    etapeDocumentVisibility.value = value
  }

  const visibilityChoices = computed<{ itemId: DocumentVisibility; legend: { main: string } }[]>(() => {
    return visibility
      .filter(visibility => {
        if (isEntrepriseOrBureauDEtude(props.user) && visibility === 'administrations') {
          return false
        }

        return true
      })
      .map(visibility => ({ itemId: visibility, legend: { main: VisibilityLabel[visibility] } }))
  })
  const updateDocumentTypeId = (documentTypeId: DocumentTypeId | null) => {
    etapeDocumentTypeId.value = documentTypeId
  }
  const content = () => (
    <form>
      {props.documentTypeIds.length === 1 ? null : (
        <fieldset class="fr-fieldset" id="text">
          <div class="fr-fieldset__element">
            <div class="fr-select-group">
              <label class="fr-label" for="type">
                Type de document
              </label>
              <DocumentTypeTypeahead documentTypeIds={props.documentTypeIds} documentTypeIdSelected={updateDocumentTypeId} />
            </div>
          </div>
        </fieldset>
      )}

      <fieldset class="fr-fieldset" id="text">
        <div class="fr-fieldset__element">
          <InputFile
            accept={['pdf']}
            uploadFile={file => {
              etapeDocumentFile.value = file
            }}
          />
        </div>

        <div class="fr-fieldset__element">
          <DsfrInputRadio legend={{ main: 'Visibilité' }} elements={visibilityChoices.value} initialValue={etapeDocumentVisibility.value} valueChanged={visibilityChange} />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInput legend={{ main: 'Description' }} initialValue={documentDescription.value} type={{ type: 'text' }} valueChanged={descriptionChange} />
        </div>
      </fieldset>
    </form>
  )

  const tempDocument = computed<Nullable<Omit<TempEtapeDocument, 'temp_document_name'>>>(() => ({
    etape_document_type_id: etapeDocumentTypeId.value,
    description: documentDescription.value,
    public_lecture: etapeDocumentVisibility.value !== null ? etapeDocumentVisibility.value === 'public' : null,
    entreprises_lecture: etapeDocumentVisibility.value !== null ? etapeDocumentVisibility.value !== 'administrations' : null,
  }))

  const canSave = computed<boolean>(() => {
    return tempEtapeDocumentValidator.omit({ temp_document_name: true }).safeParse(tempDocument.value).success && (etapeDocumentFile.value !== null || isNotNullNorUndefined(props.initialDocument))
  })

  return () => (
    <FunctionalPopup
      title={props.documentTypeIds.length === 1 ? `${isNotNullNorUndefined(props.initialDocument) ? 'Éditer' : 'Ajouter'} ${DocumentsTypes[props.documentTypeIds[0]].nom}` : "Ajout d'un document"}
      content={content}
      close={() => {
        const value = { ...props.initialDocument, ...tempDocument.value, temp_document_name: tempDocumentName.value }

        const parsed = etapeDocumentModificationValidator.safeParse(value)

        if (parsed.success) {
          props.close(parsed.data)
        } else {
          console.log(parsed.error)
          props.close(null)
        }
      }}
      validate={{
        action: async () => {
          if (etapeDocumentFile.value !== null) {
            tempDocumentName.value = await props.apiClient.uploadTempDocument(etapeDocumentFile.value)
          }
        },
      }}
      canValidate={canSave.value}
    />
  )
})
