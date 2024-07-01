import { computed, defineComponent, ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { AutreDocumentTypeId, DOCUMENTS_TYPES_IDS, DocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { InputFile } from '../_ui/dsfr-input-file'
import { ApiClient } from '@/api/api-client'
import { TempDocumentName } from 'camino-common/src/document'
import { NonEmptyArray, Nullable, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { DsfrInput } from '../_ui/dsfr-input'
import {
  EtapeDocumentModification,
  TempEtapeDocument,
  etapeDocumentModificationValidator,
  tempEtapeDocumentDescriptionObligatoireValidator,
  tempEtapeDocumentDescriptionOptionnelleValidator,
} from 'camino-common/src/etape'
import { DsfrInputRadio } from '../_ui/dsfr-input-radio'
import { VisibilityLabel } from './etape-documents'
import { isEntrepriseOrBureauDEtude, User } from 'camino-common/src/roles'
import { TypeaheadSmartSingle } from '../_ui/typeahead-smart-single'
import { z } from 'zod'

interface Props {
  close: (document: EtapeDocumentModification | null) => void
  documentTypeIds: NonEmptyArray<DocumentTypeId | AutreDocumentTypeId>
  initialDocument?: EtapeDocumentModification
  apiClient: Pick<ApiClient, 'uploadTempDocument'>
  user: User
}

type DocumentVisibility = (typeof visibility)[number]

const visibility = ['administrations', 'entreprises', 'public'] as const

const canSaveEtapeDocumentValidator = z.union([
  tempEtapeDocumentDescriptionOptionnelleValidator.omit({ temp_document_name: true }),
  tempEtapeDocumentDescriptionObligatoireValidator.omit({ temp_document_name: true }),
])
export const AddEtapeDocumentPopup = defineComponent<Props>(props => {
  const etapeDocumentTypeId = ref<DocumentTypeId | AutreDocumentTypeId | null>(props.documentTypeIds.length === 1 ? props.documentTypeIds[0] : null)
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
  const updateDocumentTypeId = (documentTypeId: DocumentTypeId | AutreDocumentTypeId | null) => {
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
              <TypeaheadSmartSingle possibleValues={props.documentTypeIds.map(id => DocumentsTypes[id])} valueIdSelected={updateDocumentTypeId} />
            </div>
          </div>
        </fieldset>
      )}

      <fieldset class="fr-fieldset" id="text">
        <div class="fr-fieldset__element" style={{ order: 1 }}>
          <InputFile
            accept={['pdf']}
            uploadFile={file => {
              etapeDocumentFile.value = file
            }}
          />
        </div>

        <div class="fr-fieldset__element" style={{ order: 2 }}>
          <DsfrInputRadio legend={{ main: 'Visibilité' }} elements={visibilityChoices.value} initialValue={etapeDocumentVisibility.value} valueChanged={visibilityChange} />
        </div>
        <div class="fr-fieldset__element" style={{ order: etapeDocumentTypeId.value === DOCUMENTS_TYPES_IDS.autreDocument ? -1 : 3 }}>
          <DsfrInput
            legend={{ main: 'Description' }}
            required={etapeDocumentTypeId.value === DOCUMENTS_TYPES_IDS.autreDocument}
            initialValue={documentDescription.value}
            type={{ type: 'text' }}
            valueChanged={descriptionChange}
          />
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
    return canSaveEtapeDocumentValidator.safeParse(tempDocument.value).success && (etapeDocumentFile.value !== null || isNotNullNorUndefined(props.initialDocument))
  })

  return () => (
    <FunctionalPopup
      title={props.documentTypeIds.length === 1 ? `${isNotNullNorUndefined(props.initialDocument) ? 'Éditer' : 'Ajouter'} ${DocumentsTypes[props.documentTypeIds[0]].nom}` : "Ajout d'un document"}
      content={content}
      close={() => {
        props.close(null)
      }}
      validate={{
        action: async () => {
          if (etapeDocumentFile.value !== null) {
            tempDocumentName.value = await props.apiClient.uploadTempDocument(etapeDocumentFile.value)
          }
          const value = { ...props.initialDocument, ...tempDocument.value, temp_document_name: tempDocumentName.value }

          const parsed = etapeDocumentModificationValidator.safeParse(value)

          if (parsed.success) {
            props.close(parsed.data)
          } else {
            console.error(parsed.error)
          }
        },
      }}
      canValidate={canSave.value}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
AddEtapeDocumentPopup.props = ['close', 'apiClient', 'documentTypeIds', 'user', 'initialDocument']
