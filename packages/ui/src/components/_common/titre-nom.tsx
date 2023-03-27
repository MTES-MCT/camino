import { FunctionalComponent } from 'vue'

interface Props {
  nom?: string
}
export const TitreNom: FunctionalComponent<Props> = props => {
  return <span class="bold">{props.nom ?? ''}</span>
}
