import { computed, defineComponent, ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import {  DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { InputFile } from '../_ui/dsfr-input-file'
import { ApiClient } from '@/api/api-client'
import { TempDocumentName } from 'camino-common/src/document'
import {  Nullable, isNonEmptyArray, isNotNullNorUndefined, map } from 'camino-common/src/typescript-tools'
import { DsfrInput } from '../_ui/dsfr-input'
import { DocumentComplementaireDaeEtapeDocumentModification, documentComplementaireDaeEtapeDocumentModificationValidator, documentTypeIdComplementaireObligatoireDAE, tempEtapeDocumentValidator } from 'camino-common/src/etape'
import { useState } from '@/utils/vue-tsx-utils'
import { DsfrSelect } from '../_ui/dsfr-select'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'

interface Props {
  close: (document: DocumentComplementaireDaeEtapeDocumentModification | null) => void
  initialDocument: DocumentComplementaireDaeEtapeDocumentModification | null
  apiClient: Pick<ApiClient, 'uploadTempDocument'>
}


export const AddEtapeDaeDocumentPopup = defineComponent<Props>(props => {
  const etapeDocumentTypeId = documentTypeIdComplementaireObligatoireDAE
  const etapeDocumentFile = ref<File | null>(null)
  const documentDescription = ref<string>(props.initialDocument?.description ?? '')
  const [documentDate, setDocumentDate] = useState(props.initialDocument?.date ?? null)
  const [etapeStatutId, setEtapeStatutId] = useState(props.initialDocument?.etapeStatutId ?? null)
  const [arretePrefectoral, setArretePrefectoral] = useState(props.initialDocument?.arretePrefectoral ?? null)
  const tempDocumentName = ref<TempDocumentName | undefined>(
    isNotNullNorUndefined(props.initialDocument) && 'temp_document_name' in props.initialDocument ? props.initialDocument.temp_document_name : undefined
  )

  const descriptionChange = (value: string) => {
    documentDescription.value = value
  }



  const etapeStatutItems = computed(() => {
    const etapeStatus = getEtapesStatuts(ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_)
    if (isNonEmptyArray(etapeStatus)) {
      
      return map(etapeStatus, ({id, nom}) => ({id, label: nom}))
    }
    throw new Error('cas impossible')
  })
  const content = () => {
    return (
    <form>
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
          <DsfrInput legend={{ main: 'Date' }} type={{type: 'date'}} initialValue={documentDate.value} valueChanged={setDocumentDate} />
        </div>

        <div class="fr-fieldset__element">
          <DsfrSelect legend={{ main: 'Statut' }} items={etapeStatutItems.value} initialValue={etapeStatutId.value} valueChanged={setEtapeStatutId} />
        </div>

        <div class="fr-fieldset__element">
          <DsfrInput legend={{ main: 'Description' }} initialValue={documentDescription.value} type={{ type: 'text' }} valueChanged={descriptionChange} />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInput legend={{ main: 'Arrêté préféctoral' }} initialValue={arretePrefectoral.value} type={{ type: 'text' }} valueChanged={setArretePrefectoral} />
        </div>
      </fieldset>
    </form>
  )}

  const tempDocument = computed<Nullable<Omit<DocumentComplementaireDaeEtapeDocumentModification, 'temp_document_name' | 'id'>>>(() => ({
    etape_document_type_id: etapeDocumentTypeId,
    description: documentDescription.value,
    public_lecture: false,
    entreprises_lecture: true,
    date: documentDate.value,
    etapeStatutId: etapeStatutId.value,
    arretePrefectoral: arretePrefectoral.value    
  }))

  const canSave = computed<boolean>(() => {
    return tempEtapeDocumentValidator.omit({ temp_document_name: true }).safeParse(tempDocument.value).success && (etapeDocumentFile.value !== null || isNotNullNorUndefined(props.initialDocument))
  })

  return () => (
    <FunctionalPopup
      title={`${isNotNullNorUndefined(props.initialDocument) ? 'Éditer' : 'Ajouter'} '${DocumentsTypes[etapeDocumentTypeId].nom}' pour la décision de l'autorité environnementale`}
      content={content}
    
      close={() => {
        props.close(null)

      }}
      validate={{
        action: async () => {
          if (etapeDocumentFile.value !== null) {
            tempDocumentName.value = await props.apiClient.uploadTempDocument(etapeDocumentFile.value)
          }
          const value = { ...props.initialDocument, ...tempDocument.value, etape_document_type_id: etapeDocumentTypeId, temp_document_name: tempDocumentName.value }
        const parsed = documentComplementaireDaeEtapeDocumentModificationValidator.safeParse(value)

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
AddEtapeDaeDocumentPopup.props = ['close', 'apiClient', 'initialDocument']