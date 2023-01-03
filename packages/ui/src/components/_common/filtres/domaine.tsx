import { Pill } from '@/components/_ui/pill'
import { Domaine, Domaines } from 'camino-common/src/static/domaines'

export interface Props {
  // TODO 2023-01-03 utilisé dans les filters.js avec des markraw, assez sale, à renommer
  element: Domaine
}

export function FiltreDomaine(props: Props) {
  return (
    <span>
      <Pill color={`bg-domaine-${props.element.id}`} class="mr-xs mono">
        {props.element.id}{' '}
      </Pill>
      <span class="cap-first h6 bold">{props.element.nom}</span>
    </span>
  )
}
