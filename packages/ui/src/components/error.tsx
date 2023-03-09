import { FunctionalComponent } from 'vue'
import { Couleur } from 'camino-common/src/static/couleurs'

interface Props {
  couleur: Couleur
  message: string
}
export const Error: FunctionalComponent<Props> = props => <div class={`mb p-s color-bg bg-${props.couleur}`}>{props.message}</div>
