import { FunctionalComponent, ButtonHTMLAttributes, HTMLAttributes } from 'vue'
import { DsfrIcon } from './dsfrIconSpriteType'
import { UseLinkOptions } from 'vue-router'
import { CaminoRouterLink } from '../../router/camino-router-link'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

export const buttonTypes = ['primary', 'secondary', 'tertiary', 'tertiary-no-outline'] as const
type ButtonType = (typeof buttonTypes)[number]
export const buttonSizes = ['sm', 'md', 'lg'] as const
type ButtonSize = (typeof buttonSizes)[number]

type DsfrButtonProps = {
  onClick: () => void
  title: string
  label?: string
  disabled?: boolean
  buttonType?: ButtonType
  buttonSize?: ButtonSize
} & ButtonHTMLAttributes
export const DsfrButton: FunctionalComponent<DsfrButtonProps> = (props: DsfrButtonProps) => {
  return (
    <button
      class={['fr-btn', `fr-btn--${props.buttonType ?? 'primary'}`, `fr-btn--${props.buttonSize ?? 'md'}`]}
      disabled={props.disabled ?? false}
      title={props.title}
      aria-label={props.title}
      onClick={props.onClick}
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
    >
      {isNotNullNorUndefined(props.label) ? props.label : null}
    </button>
  )
}

type  DsfrLinkProps = {
  title: string
  label?: string | null
  buttonType?: ButtonType
  icon: DsfrIcon | null
  style?: HTMLAttributes['style']
} & ({to: UseLinkOptions['to'],
disabled: boolean} | {href: HTMLAnchorElement['href'], download?: HTMLAnchorElement['download']})
export const DsfrLink: FunctionalComponent<DsfrLinkProps> = props => {
  const iconClass = []
  if (props.icon !== null && props.label !== null) {
    iconClass.push(`fr-${props.buttonType ? 'btn' : 'link'}--icon-right`)
  }

  return ( <>{ 'to' in props ?
    <CaminoRouterLink
      class={[props.buttonType ? ['fr-btn', `fr-btn--${props.buttonType ?? 'primary'}`] : 'fr-link', iconClass, props.icon]}
      isDisabled={props.disabled}
      title={props.title}
      to={props.to}
      style={props.style}
    >
      {isNotNullNorUndefined(props.label) ? props.label : props.title}
    </CaminoRouterLink>
  : <a
  class={[props.buttonType ? ['fr-btn', `fr-btn--${props.buttonType ?? 'primary'}`] : 'fr-link', iconClass, props.icon]}
  title={props.title}
  href={props.href}
  download={props.download}
      style={props.style}
  >{isNotNullNorUndefined(props.label) ? props.label : props.title}</a> }</>)
}
