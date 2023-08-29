import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { sirenValidator } from 'camino-common/src/entreprise'
import { User } from 'camino-common/src/roles'
import { ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { EntrepriseApiClient } from './entreprise-api-client'
import { DsfrInput } from '../_ui/dsfr-input'

interface Props {
  close: () => void
  user: User
  apiClient: Pick<EntrepriseApiClient, 'creerEntreprise'>
}
export const EntrepriseAddPopup = caminoDefineComponent<Props>(['close', 'user', 'apiClient'], props => {
  const siren = ref('')
  const sirenChange = (value: string) => {
    siren.value = value
  }
  const content = () => (
    <form>
      <DsfrInput legend={{ main: 'Pays' }} disabled={true} valueChanged={() => {}} initialValue={'France'} type={{ type: 'text' }} />
      <DsfrInput legend={{ main: 'Siren' }} valueChanged={sirenChange} type={{ type: 'text' }} />
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
