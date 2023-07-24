import { FunctionalComponent } from 'vue'
import { Couleur } from 'camino-common/src/static/couleurs'
import { User } from 'camino-common/src/roles'

interface Props {
  couleur: Couleur
  message: string
}
export const CaminoError: FunctionalComponent<Props> = props => <div class={`mb p-s color-bg bg-${props.couleur}`}>{props.message}</div>

interface CaminoAccessErrorProps {
  user: User
}

export const CaminoAccessError: FunctionalComponent<CaminoAccessErrorProps> = props => {
  if (props.user) {
    return <div class={`mb p-s color-bg bg-error`}>Erreur: vous n'avez pas le droit d'accéder à ce contenu</div>
  } else {
    return <div class={`mb p-s color-bg bg-info`}>Vous n'avez pas accès à cette page, veuillez vous connecter</div>
  }
}

// Demandé par le router car utilisé dans un import asynchrone /shrug
CaminoError.displayName = 'CaminoError'
CaminoAccessError.displayName = 'CaminoAccessError'
