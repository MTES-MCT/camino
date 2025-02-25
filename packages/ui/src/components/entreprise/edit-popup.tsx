import { EntrepriseType } from 'camino-common/src/entreprise'
import { isSuper, User } from 'camino-common/src/roles'
import { defineComponent, ref } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { EntrepriseApiClient } from './entreprise-api-client'
import { DsfrInput } from '../_ui/dsfr-input'
import { DsfrInputCheckbox } from '../_ui/dsfr-input-checkbox'

interface Props {
  close: () => void
  user: User
  entreprise: Pick<EntrepriseType, 'id' | 'telephone' | 'email' | 'url' | 'archive'>
  apiClient: Pick<EntrepriseApiClient, 'modifierEntreprise'>
}

export const EntrepriseEditPopup = defineComponent<Props>(props => {
  const telephone = ref(props.entreprise.telephone ?? undefined)
  const email = ref(props.entreprise.email ?? undefined)
  const url = ref(props.entreprise.url ?? undefined)
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
      <DsfrInput required={false} legend={{ main: 'Téléphone' }} type={{ type: 'text' }} valueChanged={telephoneChange} initialValue={telephone.value} />
      <DsfrInput required={false} legend={{ main: 'Adresse électronique' }} type={{ type: 'text' }} valueChanged={emailChange} initialValue={email.value} />
      <DsfrInput required={false} legend={{ main: 'Site internet' }} type={{ type: 'text' }} valueChanged={urlChange} initialValue={url.value} />

      {isSuper(props.user) ? <DsfrInputCheckbox id="archive" class="fr-mt-2w" legend={{ main: 'Archivée' }} initialValue={archive.value} valueChanged={archiveChange} /> : null}
    </form>
  )

  const save = async () => {
    return props.apiClient.modifierEntreprise({
      id: props.entreprise.id,
      telephone: telephone.value,
      email: email.value,
      url: url.value,
      archive: archive.value,
    })
  }

  return () => <FunctionalPopup title="Modification d'une entreprise" content={content} close={props.close} validate={{ action: save }} canValidate={true} />
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EntrepriseEditPopup.props = ['close', 'user', 'entreprise', 'apiClient']
