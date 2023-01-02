import { Couleur } from 'camino-common/src/static/couleurs'
import { DomaineId } from 'camino-common/src/static/domaines'
import { Pill } from '../_ui/pill'

export interface Props {
  color?: Couleur | `domaine-${DomaineId}`
  nom?: string
}

export function Statut(props: Props) {
  return (
    <Pill color={`bg-${props.color ?? 'neutral'}`}>
      {props.nom ?? 'indéfini'}
    </Pill>
  )
}
