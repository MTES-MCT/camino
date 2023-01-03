import { Couleur } from 'camino-common/src/static/couleurs'
import { FunctionalComponent, renderSlot } from 'vue'

export interface Props {
  color?: `bg-${Couleur}`
  mini?: boolean
}

export const Tag: FunctionalComponent<Props> = (props, context) => {
  let css: string = props.color ?? 'bg-neutral'

  if (props.mini ?? false) {
    css += ' py-xxs px-xs'
  } else {
    css += ' py-xs px-s'
  }

  return (
    <span class="bold cap-first small">
      <span class={`${css} rnd-xs color-bg box`}>
        {renderSlot(context.slots, 'default')}
      </span>
    </span>
  )
}
