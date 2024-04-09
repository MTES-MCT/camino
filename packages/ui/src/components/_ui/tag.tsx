import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { FunctionalComponent, HTMLAttributes } from 'vue'
import { UseLinkOptions } from 'vue-router'
import { CaminoRouterLink } from '../../router/camino-router-link'

type DsfrTagProps = {
  ariaLabel: string
  label?: string
  tagSize?: 'sm' | 'md'
  class?: HTMLAttributes['class']
  style?: HTMLAttributes['style']
  to?: UseLinkOptions['to']
  onClicked?: () => void
}
export const DsfrTag: FunctionalComponent<DsfrTagProps> = props => {
  const classes = ['fr-tag', `fr-tag--${props.tagSize ?? 'md'}`, props.class]

  const clicked = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    props.onClicked?.()
  }

  const label = isNotNullNorUndefined(props.label) ? props.label : props.ariaLabel

  return (
    <>
      {isNotNullNorUndefined(props.to) ? (
        <CaminoRouterLink class={classes} isDisabled={false} title={props.ariaLabel} to={props.to} style={props.style}>
          {label}
        </CaminoRouterLink>
      ) : (
        <>
          {isNotNullNorUndefined(props.onClicked) ? (
            <button class={[classes, 'fr-tag--dismiss']} title={props.ariaLabel} style={props.style} onClick={clicked}>
              {label}
            </button>
          ) : (
            <p class={classes} title={props.ariaLabel} aria-label={props.ariaLabel} style={props.style}>
              {label}
            </p>
          )}
        </>
      )}
    </>
  )
}
