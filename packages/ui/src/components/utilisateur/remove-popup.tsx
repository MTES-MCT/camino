import { FunctionalComponent } from 'vue'
import { FunctionalPopup } from '../_ui/functional-popup'
interface Props {
  utilisateur: { nom: string; prenom: string }
  close: () => void
  deleteUser: () => Promise<void>
}

export const RemovePopup: FunctionalComponent<Props> = props => {
  const content = () => (
    <>
      <p class="bold">
        Souhaitez vous supprimer le compte de {props.utilisateur.prenom} {props.utilisateur.nom} ?
      </p>
      <div class="bg-warning color-bg p-s mb-l">
        <span class="bold"> Attention </span>: cette opération est définitive et ne peut pas être annulée.
      </div>
    </>
  )
  return <FunctionalPopup title="Suppression du compte utilisateur" content={content} close={props.close} validate={{ action: props.deleteUser, text: 'Supprimer' }} />
}
