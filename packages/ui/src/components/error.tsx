import { FunctionalComponent } from 'vue'
import { Couleur } from 'camino-common/src/static/couleurs'

interface Props {
  couleur: Couleur
  message: string
}
export const CaminoError: FunctionalComponent<Props> = props => <div class={`mb p-s color-bg bg-${props.couleur}`}>{props.message}</div>

// Demandé par le router car utilisé dans un import asynchrone /shrug
CaminoError.displayName = 'CaminoError'