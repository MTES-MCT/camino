import { Pill } from '@/components/_ui/pill'
import { DomaineId } from 'camino-common/src/static/domaines'

export type Props = {
  element: { id: DomaineId; nom: string }
}

export function FiltresDomaines(props: Props) {
  return (
    <span>
      <Pill color={`bg-domaine-${props.element.id}`} class="mr-xs mono">
        {props.element.id}{' '}
      </Pill>
      <span class="cap-first h6 bold">{props.element.nom}</span>
    </span>
  )
}
