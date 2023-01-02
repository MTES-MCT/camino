import { Couleur } from 'camino-common/src/static/couleurs'
import { DomaineId } from 'camino-common/src/static/domaines'
import { EmitsOptions, HTMLAttributes, SetupContext } from 'vue'

export type Props = {
  color?: `bg-${Couleur}` | `bg-domaine-${DomaineId}`
} & HTMLAttributes

export function Pill(
  props: Props,
  context: Omit<SetupContext<EmitsOptions>, 'expose'>
) {
  return (
    <span class={`cap-first small bold`}>
      <span class={`${props.color ?? 'bg-neutral'} color-bg pill py-xs px-s`}>
        {context.slots.default ? context.slots.default() : null}
      </span>
    </span>
  )
}
