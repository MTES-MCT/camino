import { caminoDefineComponent, updateFromEvent } from '@/utils/vue-tsx-utils'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { computed, ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { uiEntrepriseDocumentInputValidator } from './entreprise-api-client'
import { DocumentsTypes, EntrepriseDocumentTypeId, EntrepriseDocumentTypeIds, sortedEntrepriseDocumentTypes } from 'camino-common/src/static/documentsTypes'
import { InputDate } from '../_ui/dsfr-input-date'
import { CaminoDate } from 'camino-common/src/date'
import { InputFile } from '../_ui/dsfr-input-file'
import { ApiClient } from '@/api/api-client'
import { DsfrInput } from '../_ui/dsfr-input'

interface Props {
  close: () => void
  entrepriseId: EntrepriseId
  lockedEntrepriseDocumentTypeId?: EntrepriseDocumentTypeId
  apiClient: Pick<ApiClient, 'creerEntrepriseDocument' | 'uploadTempDocument'>
}
export const AddEntrepriseDocumentPopup = caminoDefineComponent<Props>(['close', 'entrepriseId', 'apiClient', 'lockedEntrepriseDocumentTypeId'], props => {
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

  const typeChange = (e: Event) => updateFromEvent(e, entrepriseDocumentTypeId)
  const content = () => (
    <form>
      {props.lockedEntrepriseDocumentTypeId ? null : (
        <fieldset class="fr-fieldset" id="text">
          <div class="fr-fieldset__element">
            <div class="fr-select-group">
              <label class="fr-label" for="type">
                Type de document
              </label>
              <select class="fr-select" name="type" onChange={typeChange}>
                <option value="" selected disabled hidden>
                  Selectionnez un type de document
                </option>
                {sortedEntrepriseDocumentTypes.map(edt => {
                  return <option value={edt.id}>{edt.nom}</option>
                })}
              </select>
            </div>
          </div>
        </fieldset>
      )}

      <InputDate id="add-entreprise-document-date" legend={{ main: 'Date de délivrance du document' }} dateChanged={dateChange} />
      <fieldset class="fr-fieldset" id="text">
        <div class="fr-fieldset__element">
          <InputFile accept={['pdf']} uploadFile={fileChange} />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInput legend={{ main: 'Description' }} type={{ type: 'text' }} valueChanged={descriptionChange} />
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

  const validate = {
    action: async () => {
      if (entrepriseDocumentFile.value !== null) {
        const tempDocumentName = await props.apiClient.uploadTempDocument(entrepriseDocumentFile.value)
        await props.apiClient.creerEntrepriseDocument(props.entrepriseId, uiEntrepriseDocumentInputValidator.parse(inputed.value), tempDocumentName)
      }
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
