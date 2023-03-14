import { Couleur } from 'camino-common/src/static/couleurs'
import { DomaineId } from 'camino-common/src/static/domaines'
import { HTMLAttributes } from 'vue'
import { Pill } from '../_ui/pill'

export type Props = {
  color?: Couleur | `domaine-${DomaineId}`
  nom?: string
} & HTMLAttributes

export function Statut(props: Props) {
  return <Pill color={`bg-${props.color ?? 'neutral'}`} text={props.nom ?? 'indéfini'} />
}
