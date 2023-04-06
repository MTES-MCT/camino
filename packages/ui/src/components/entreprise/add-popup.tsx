import { caminoDefineComponent, updateFromEvent } from '@/utils/vue-tsx-utils'
import { sirenValidator } from 'camino-common/src/entreprise'
import { User } from 'camino-common/src/roles'
import { ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { EntrepriseApiClient } from './entreprise-api-client'

interface Props {
  close: () => void
  user: User
  apiClient: Pick<EntrepriseApiClient, 'creerEntreprise'>
}
export const EntrepriseAddPopup = caminoDefineComponent<Props>(['close', 'user', 'apiClient'], props => {
  const siren = ref('')
  const content = () => (
    <form>
      <div class="fr-input-group">
        <label class="fr-label" for="pays">
          Pays
        </label>
        <input value="France" disabled class="fr-input" name="pays" id="pays" type="text" />
      </div>
      <div class="fr-input-group">
        <label class="fr-label" for="siren">
          Siren
        </label>
        <input onInput={e => updateFromEvent(e, siren)} value={siren.value} class="fr-input" name="siren" id="siren" type="text" />
      </div>
    </form>
  )
  return () => (
    <FunctionalPopup
      title="Création d'une entreprise"
      content={content}
      close={props.close}
      validate={{ action: () => props.apiClient.creerEntreprise(sirenValidator.parse(siren.value)), can: sirenValidator.safeParse(siren.value).success }}
    />
  )
})
