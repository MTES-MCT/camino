import { capitalize } from 'camino-common/src/strings'
import { FunctionalComponent } from 'vue'

interface Props {
  nom?: string
}
export const Nom: FunctionalComponent<Props> = props => {
  const nom = capitalize(props.nom ?? 'indéfini')
  return <p class="h6 bold mb-0">{nom}</p>
}
