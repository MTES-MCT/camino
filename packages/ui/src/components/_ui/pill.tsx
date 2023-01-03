import { Couleur } from 'camino-common/src/static/couleurs'
import { DomaineId } from 'camino-common/src/static/domaines'
import { FunctionalComponent, HTMLAttributes } from 'vue'

export type Props = {
  color?: `bg-${Couleur}` | `bg-domaine-${DomaineId}`
} & HTMLAttributes

export const Pill: FunctionalComponent<Props> = (props, context) => {
  return (
    <span class={`cap-first small bold`}>
      <span class={`${props.color ?? 'bg-neutral'} color-bg pill py-xs px-s`}>
        {context.slots.default ? context.slots.default() : null}
      </span>
    </span>
  )
}
