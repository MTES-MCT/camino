import { Couleur } from 'camino-common/src/static/couleurs'
import { FunctionalComponent, HTMLAttributes } from 'vue'

export type Props = {
  color?: `bg-${Couleur}`
  mini?: boolean
  text: string
} & HTMLAttributes

/**
 * @deprecated use DsfrTag
 */
export const Tag: FunctionalComponent<Props> = props => {
  let css: string = props.color ?? 'bg-neutral'

  if (props.mini ?? false) {
    css += ' py-xxs px-xs'
  } else {
    css += ' py-xs px-s'
  }

  return (
    <span class="bold cap-first small">
      <span class={`${css} rnd-xs color-bg box`}>{props.text}</span>
    </span>
  )
}

type DsfrTagProps = {
  ariaLabel: string
  label?: string
  tagSize?: 'sm' | 'md'
} & HTMLAttributes
// TODO 2023-07-10 Faire un DsfrClickableTag ou faire évoluer ce composant ?
export const DsfrTag: FunctionalComponent<DsfrTagProps> = props => {
  return (
    <p class={['fr-tag', `fr-tag--${props.tagSize ?? 'md'}`]} title={props.ariaLabel} aria-label={props.ariaLabel}>
      {props.label ?? props.ariaLabel}
    </p>
  )
}
