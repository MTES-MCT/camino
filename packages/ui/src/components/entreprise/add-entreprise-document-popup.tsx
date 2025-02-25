import { EntrepriseDocumentId, EntrepriseId } from 'camino-common/src/entreprise'
import { computed, defineComponent, ref } from 'vue'
import { FunctionalPopup, Validate } from '../_ui/functional-popup'
import { uiEntrepriseDocumentInputValidator } from './entreprise-api-client'
import { DocumentsTypes, EntrepriseDocumentTypeId, EntrepriseDocumentTypeIds, sortedEntrepriseDocumentTypes } from 'camino-common/src/static/documentsTypes'
import { CaminoDate } from 'camino-common/src/date'
import { InputFile } from '../_ui/dsfr-input-file'
import { ApiClient } from '@/api/api-client'
import { DsfrInput } from '../_ui/dsfr-input'
import { DsfrSelect } from '../_ui/dsfr-select'
import { map } from 'camino-common/src/typescript-tools'

interface Props {
  close: () => void
  entrepriseId: EntrepriseId
  lockedEntrepriseDocumentTypeId?: EntrepriseDocumentTypeId
  apiClient: Pick<ApiClient, 'creerEntrepriseDocument' | 'uploadTempDocument'>
}
export const AddEntrepriseDocumentPopup = defineComponent<Props>(props => {
  const entrepriseDocumentTypeId = ref<(typeof EntrepriseDocumentTypeIds)[number] | null>(props.lockedEntrepriseDocumentTypeId ?? null)
  const documentDate = ref<CaminoDate | null>(null)
  const entrepriseDocumentFile = ref<File | null>(null)
  const documentDescription = ref<string>('')

  const descriptionChange = (value: string) => {
    documentDescription.value = value
  }

  const fileChange = (file: File) => {
    entrepriseDocumentFile.value = file
  }

  const dateChange = (date: CaminoDate | null) => {
    documentDate.value = date
  }

  const documentsTypes = map(sortedEntrepriseDocumentTypes, edt => ({ id: edt.id, label: edt.nom }))

  const typeChange = (e: EntrepriseDocumentTypeId | null) => {
    entrepriseDocumentTypeId.value = e
  }
  const content = () => (
    <form>
      {props.lockedEntrepriseDocumentTypeId ? null : (
        <fieldset class="fr-fieldset" id="text">
          <div class="fr-fieldset__element">
            <DsfrSelect
              id="nouveau_document_type"
              required={true}
              legend={{ main: 'Type de document', placeholder: 'Selectionnez un type de document' }}
              initialValue={null}
              items={documentsTypes}
              valueChanged={typeChange}
            />
          </div>
        </fieldset>
      )}

      <fieldset class="fr-fieldset" id="text">
        <div class="fr-fieldset__element">
          <DsfrInput id="nouveau_document_date" required={true} legend={{ main: 'Date de délivrance du document' }} type={{ type: 'date' }} valueChanged={dateChange} />
        </div>
        <div class="fr-fieldset__element">
          <InputFile required={true} accept={['pdf']} uploadFile={fileChange} />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInput id="nouveau_document_description" required={true} legend={{ main: 'Description' }} type={{ type: 'text' }} valueChanged={descriptionChange} />
        </div>
      </fieldset>
    </form>
  )

  const inputed = computed(() => {
    return {
      typeId: entrepriseDocumentTypeId.value,
      date: documentDate.value,
      description: documentDescription.value,
    }
  })

  const validate: Validate<{ id: EntrepriseDocumentId } | null> = {
    action: async () => {
      if (entrepriseDocumentFile.value !== null) {
        const tempDocumentName = await props.apiClient.uploadTempDocument(entrepriseDocumentFile.value)
        return props.apiClient.creerEntrepriseDocument(props.entrepriseId, uiEntrepriseDocumentInputValidator.parse(inputed.value), tempDocumentName)
      }
      return null
    },
  }

  return () => (
    <FunctionalPopup
      title={props.lockedEntrepriseDocumentTypeId ? `Ajouter ${DocumentsTypes[props.lockedEntrepriseDocumentTypeId].nom}` : "Ajout d'un document"}
      content={content}
      close={props.close}
      validate={validate}
      canValidate={uiEntrepriseDocumentInputValidator.safeParse(inputed.value).success && entrepriseDocumentFile.value !== null}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
AddEntrepriseDocumentPopup.props = ['close', 'entrepriseId', 'apiClient', 'lockedEntrepriseDocumentTypeId']
