import { FunctionalComponent } from 'vue'
import { User } from 'camino-common/src/roles'
import { Alert } from './_ui/alert'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

interface CaminoAccessErrorProps {
  user: User
}

export const CaminoAccessError: FunctionalComponent<CaminoAccessErrorProps> = props => {
  if (isNotNullNorUndefined(props.user)) {
    return <Alert small={true} title="Erreur: vous n’avez pas le droit d’accéder à ce contenu" type="error" />
  } else {
    return <Alert small={true} title="Vous n’avez pas accès à cette page, veuillez vous connecter" type="info" />
  }
}
// Demandé par le router car utilisé dans un import asynchrone /shrug
CaminoAccessError.displayName = 'CaminoAccessError'
