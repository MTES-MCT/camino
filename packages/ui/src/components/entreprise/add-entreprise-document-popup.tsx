import { caminoDefineComponent, updateFromEvent } from '@/utils/vue-tsx-utils'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { EntrepriseApiClient, uiEntrepriseDocumentInputValidator } from './entreprise-api-client'
import { DocumentsTypes, EntrepriseDocumentTypeId, EntrepriseDocumentTypeIds, sortedEntrepriseDocumentTypes } from 'camino-common/src/static/documentsTypes'
import { InputDate } from '../_ui/dsfr-input-date'
import { CaminoDate } from 'camino-common/src/date'
import { InputFile } from '../_ui/dsfr-input-file'

interface Props {
  close: () => void
  entrepriseId: EntrepriseId
  lockedEntrepriseDocumentTypeId?: EntrepriseDocumentTypeId
  apiClient: Pick<EntrepriseApiClient, 'creerEntrepriseDocument'>
}
export const AddEntrepriseDocumentPopup = caminoDefineComponent<Props>(['close', 'entrepriseId', 'apiClient', 'lockedEntrepriseDocumentTypeId'], props => {
  const entrepriseDocumentTypeId = ref<(typeof EntrepriseDocumentTypeIds)[number] | null>(props.lockedEntrepriseDocumentTypeId ?? null)
  const documentDate = ref<CaminoDate | null>(null)
  const entrepriseDocumentFile = ref<File | null>(null)
  const documentDescription = ref<string>('')

  const content = () => (
    <form>
      {props.lockedEntrepriseDocumentTypeId ? null : (
        <fieldset class="fr-fieldset" id="text">
          <div class="fr-fieldset__element">
            <div class="fr-select-group">
              <label class="fr-label" for="type">
                Type de document
              </label>
              <select class="fr-select" name="type" onChange={e => updateFromEvent(e, entrepriseDocumentTypeId)}>
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

      <InputDate
        id="add-entreprise-document-date"
        legend={{ main: 'Date de délivrance du document' }}
        dateChanged={date => {
          documentDate.value = date
        }}
      />
      <fieldset class="fr-fieldset" id="text">
        <div class="fr-fieldset__element">
          <InputFile
            accept={['pdf']}
            uploadFile={file => {
              entrepriseDocumentFile.value = file
            }}
          />
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group">
            <label class="fr-label" for="description">
              Description
            </label>
            <input class="fr-input" name="text" id="description" type="text" onChange={e => updateFromEvent(e, documentDescription)} />
          </div>
        </div>
      </fieldset>
    </form>
  )
  return () => (
    <FunctionalPopup
      title={props.lockedEntrepriseDocumentTypeId ? `Ajouter ${DocumentsTypes[props.lockedEntrepriseDocumentTypeId].nom}` : "Ajout d'un document"}
      content={content}
      close={props.close}
      validate={{
        action: async () => {
          await props.apiClient.creerEntrepriseDocument(
            props.entrepriseId,
            uiEntrepriseDocumentInputValidator.parse({
              typeId: entrepriseDocumentTypeId.value,
              date: documentDate.value,
              document: entrepriseDocumentFile.value,
              description: documentDescription.value,
            })
          )
        },
        can: uiEntrepriseDocumentInputValidator.safeParse({
          typeId: entrepriseDocumentTypeId.value,
          date: documentDate.value,
          document: entrepriseDocumentFile.value,
          description: documentDescription.value,
        }).success,
      }}
    />
  )
})
