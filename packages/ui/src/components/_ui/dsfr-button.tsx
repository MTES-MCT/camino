import { FunctionalComponent, ButtonHTMLAttributes } from 'vue'
import { DsfrIcon } from './dsfrIconSpriteType'
import { UseLinkOptions } from 'vue-router'
import { CaminoRouterLink } from '../../router/camino-router-link'

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
      {props.label ? props.label : props.title}
    </button>
  )
}

type DsfrButtonIconProps = DsfrButtonProps & { icon: DsfrIcon }

export const DsfrButtonIcon: FunctionalComponent<DsfrButtonIconProps> = (props: DsfrButtonIconProps) => {
  return (
    <button
      class={['fr-btn', `fr-btn--${props.buttonType ?? 'primary'}`, `fr-btn--${props.buttonSize ?? 'md'}`, props.icon, props.label ? 'fr-btn--icon-right' : null]}
      disabled={props.disabled ?? false}
      title={props.title}
      aria-label={props.title}
      onClick={props.onClick}
    >
      {props.label ? props.label : null}
    </button>
  )
}

interface DsfrLinkProps {
  title: string
  label?: string | null
  buttonType?: ButtonType
  to: UseLinkOptions['to']
  icon: DsfrIcon | null
  disabled: boolean
}
export const DsfrLink: FunctionalComponent<DsfrLinkProps> = props => {
  const iconClass = []
  if (props.icon !== null) {
    if (props.label !== null) {
      iconClass.push(`fr-${props.buttonType ? 'btn' : 'link'}--icon-right`)
    }
  }

  return (
    <CaminoRouterLink
      class={[props.buttonType ? ['fr-btn', `fr-btn--${props.buttonType ?? 'primary'}`] : 'fr-link', iconClass, props.icon]}
      isDisabled={props.disabled}
      title={props.title}
      to={props.to}
    >
      {props.label ? props.label : props.title}
    </CaminoRouterLink>
  )
}
