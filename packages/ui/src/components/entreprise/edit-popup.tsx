import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { isSuper, User } from 'camino-common/src/roles'
import { ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { EntrepriseApiClient } from './entreprise-api-client'
import { DsfrInput } from '../_ui/dsfr-input'
import { DsfrInputCheckbox } from '../_ui/dsfr-input-checkbox'

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

  const telephoneChange = (value: string) => {
    telephone.value = value
  }
  const emailChange = (value: string) => {
    email.value = value
  }
  const urlChange = (value: string) => {
    url.value = value
  }
  const archiveChange = (value: boolean) => {
    archive.value = value
  }
  const content = () => (
    <form>
      <DsfrInput legend={{ main: 'Téléphone' }} type={{ type: 'text' }} valueChanged={telephoneChange} initialValue={telephone.value} />
      <DsfrInput legend={{ main: 'Adresse électronique' }} type={{ type: 'text' }} valueChanged={emailChange} initialValue={email.value} />
      <DsfrInput legend={{ main: 'Site internet' }} type={{ type: 'text' }} valueChanged={urlChange} initialValue={url.value} />

      {isSuper(props.user) ? <DsfrInputCheckbox legend={{ main: 'Archivée' }} initialValue={archive.value} valueChanged={archiveChange} /> : null}
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

  return () => <FunctionalPopup title="Modification d'une entreprise" content={content} close={props.close} validate={{ action: save }} canValidate={true} />
})
