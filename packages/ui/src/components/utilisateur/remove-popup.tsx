import { FunctionalComponent } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
import { Alert } from '@/components/_ui/alert'
interface Props {
  utilisateur: { nom: string; prenom: string }
  close: () => void
  deleteUser: () => Promise<void>
}

export const RemovePopup: FunctionalComponent<Props> = props => {
  const content = () => (
    <Alert
      type="warning"
      title="Attention : cette opération est définitive et ne peut pas être annulée."
      description={() => (
        <>
          Souhaitez vous supprimer le compte de{' '}
          <span class="fr-text--bold">
            {props.utilisateur.prenom} {props.utilisateur.nom}
          </span>{' '}
          ?
        </>
      )}
    />
  )
  return <FunctionalPopup title={`Suppression du compte utilisateur`} content={content} close={props.close} validate={{ action: props.deleteUser, text: 'Supprimer' }} />
}
