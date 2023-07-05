import { FunctionalComponent, ButtonHTMLAttributes } from 'vue'
import { DsfrIcon } from './dsfrIconSpriteType'

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
