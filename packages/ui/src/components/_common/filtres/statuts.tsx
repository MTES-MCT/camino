import { Couleur } from 'camino-common/src/static/couleurs'
import { DomaineId } from 'camino-common/src/static/domaines'
import { Statut } from '../statut'

export type Props = {
  element: { couleur: Couleur; nom: string }
}

export function FiltresStatuts(props: Props) {
  return (
    <Statut
      color={props.element.couleur}
      nom={props.element.nom}
      class="inline-block mb-s"
    />
  )
}
