import { Couleur } from 'camino-common/src/static/couleurs'
import { FunctionalComponent } from 'vue'
import { Statut } from '../statut'

export type Props = {
  element: { couleur: Couleur; nom: string }
}

export const FiltresStatuts: FunctionalComponent<Props> = (props: Props) => {
  return <Statut color={props.element.couleur} nom={props.element.nom} class="inline-block mb-s" />
}
