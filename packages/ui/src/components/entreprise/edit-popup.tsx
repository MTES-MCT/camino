import { caminoDefineComponent, updateFromEvent, updateFromCheckboxEvent } from '@/utils/vue-tsx-utils'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { isSuper, User } from 'camino-common/src/roles'
import { ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { EntrepriseApiClient } from './entreprise-api-client'

interface Props {
  close: () => void
  user: User
  entreprise: {
    id: EntrepriseId
    telephone?: string
    email?: string
    url?: string
    archive?: boolean
  }
  apiClient: Pick<EntrepriseApiClient, 'modifierEntreprise'>
}

export const EntrepriseEditPopup = caminoDefineComponent<Props>(['close', 'user', 'entreprise', 'apiClient'], props => {
  const telephone = ref(props.entreprise.telephone ?? '')
  const email = ref(props.entreprise.email ?? '')
  const url = ref(props.entreprise.url ?? '')
  const archive = ref(props.entreprise.archive ?? false)

  const content = () => (
    <form>
      <div class="fr-input-group">
        <label class="fr-label" for="telephone">
          Téléphone
        </label>
        <input onInput={e => updateFromEvent(e, telephone)} value={telephone.value} class="fr-input" name="telephone" id="telephone" type="text" />
      </div>

      <div class="fr-input-group">
        <label class="fr-label" for="email">
          Adresse électronique
        </label>
        <input onInput={e => updateFromEvent(e, email)} value={email.value} class="fr-input" name="email" id="email" type="text" />
      </div>

      <div class="fr-input-group">
        <label class="fr-label" for="url">
          Site internet
        </label>
        <input onInput={e => updateFromEvent(e, url)} value={url.value} class="fr-input" name="url" id="url" type="text" />
      </div>
      {isSuper(props.user) ? (
        <div class="fr-fieldset__element fr-fieldset__element--inline">
          <div class="fr-checkbox-group">
            <input onInput={e => updateFromCheckboxEvent(e, archive)} checked={archive.value} name="archive" id="archive" type="checkbox" />
            <label class="fr-label" for="archive">
              Archivée
            </label>
          </div>
        </div>
      ) : null}
    </form>
  )

  const save = async () => {
    await props.apiClient.modifierEntreprise({
      id: props.entreprise.id,
      telephone: telephone.value,
      email: email.value,
      url: url.value,
      archive: archive.value,
    })
  }
  return () => <FunctionalPopup title="Modification d'une entreprise" content={content} close={props.close} validate={{ action: save }} />
})
