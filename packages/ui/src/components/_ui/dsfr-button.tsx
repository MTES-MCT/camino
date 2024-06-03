import { FunctionalComponent, ButtonHTMLAttributes, HTMLAttributes } from 'vue'
import { DsfrIcon } from './dsfrIconSpriteType'
import { CaminoRouterLink } from '../../router/camino-router-link'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { CaminoRouteNames, CaminoVueRoute } from '@/router/routes'

export const buttonTypes = ['primary', 'secondary', 'tertiary', 'tertiary-no-outline'] as const
type ButtonType = (typeof buttonTypes)[number]
export const buttonSizes = ['sm', 'md', 'lg'] as const
type ButtonSize = (typeof buttonSizes)[number]

type DsfrButtonProps = {
  onClick: () => void
  title: string
  label?: string
  icon?: DsfrIcon
  disabled?: boolean
  buttonType?: ButtonType
  buttonSize?: ButtonSize
  style?: ButtonHTMLAttributes['style']
  class?: ButtonHTMLAttributes['class']
  type?: ButtonHTMLAttributes['type']
}
export const DsfrButton: FunctionalComponent<DsfrButtonProps> = (props: DsfrButtonProps) => {
  const iconClass = []
  if (isNotNullNorUndefined(props.icon)) {
    iconClass.push('fr-btn--icon-right')
    iconClass.push(props.icon)
  }

  return (
    <button
      class={['fr-btn', ...iconClass, `fr-btn--${props.buttonType ?? 'primary'}`, `fr-btn--${props.buttonSize ?? 'md'}`]}
      disabled={props.disabled ?? false}
      title={props.title}
      aria-label={props.title}
      onClick={props.onClick}
      type={props.type ?? 'button'}
    >
      {isNotNullNorUndefined(props.label) ? props.label : props.title}
    </button>
  )
}

type DsfrButtonIconProps = DsfrButtonProps & { icon: DsfrIcon }

export const DsfrButtonIcon: FunctionalComponent<DsfrButtonIconProps> = (props: DsfrButtonIconProps) => {
  return (
    <button
      class={['fr-btn', `fr-btn--${props.buttonType ?? 'primary'}`, `fr-btn--${props.buttonSize ?? 'md'}`, props.icon, isNotNullNorUndefined(props.label) ? 'fr-btn--icon-right' : null]}
      disabled={props.disabled ?? false}
      title={props.title}
      aria-label={props.title}
      onClick={props.onClick}
      type={props.type ?? 'button'}
    >
      {isNotNullNorUndefined(props.label) ? props.label : null}
    </button>
  )
}
type DsfrLinkProps<T extends CaminoRouteNames> = {
  title: string
  label?: string | null
  buttonType?: ButtonType
  icon: DsfrIcon | null
  style?: HTMLAttributes['style']
  class?: HTMLAttributes['class']
} & ({ to: CaminoVueRoute<T>; disabled: false } | { href: HTMLAnchorElement['href']; download?: HTMLAnchorElement['download']; target?: HTMLAnchorElement['target']; rel?: HTMLAnchorElement['rel'] })
export const DsfrLink = <T extends CaminoRouteNames>(props: DsfrLinkProps<T>) => {
  const iconClass = []
  if (props.icon !== null && props.label !== null) {
    iconClass.push(`fr-${props.buttonType ? 'btn' : 'link'}--icon-right`)
  }

  return (
    <>
      {'to' in props ? (
        <CaminoRouterLink
          class={[props.class, props.buttonType ? ['fr-btn', `fr-btn--${props.buttonType ?? 'primary'}`] : 'fr-link', iconClass, props.icon]}
          isDisabled={props.disabled}
          title={props.title}
          to={props.to}
          style={props.style}
        >
          {isNotNullNorUndefined(props.label) ? props.label : props.title}
        </CaminoRouterLink>
      ) : (
        <a
          class={[props.class, props.buttonType ? ['fr-btn', `fr-btn--${props.buttonType ?? 'primary'}`] : 'fr-link', iconClass, props.icon]}
          title={props.title}
          href={props.href}
          download={props.download}
          target={props.target}
          style={props.style}
          rel={props.rel}
        >
          {isNotNullNorUndefined(props.label) ? props.label : props.title}
        </a>
      )}
    </>
  )
}
