import { FunctionalComponent, ButtonHTMLAttributes, HTMLAttributes } from 'vue'
import { fr, FrIconClassName } from '@codegouvfr/react-dsfr'

import { CaminoRouterLink } from '../../router/camino-router-link'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { CaminoRouteNames, CaminoVueRoute } from '@/router/routes'
import type { JSX } from 'vue/jsx-runtime'

export const buttonTypes = ['primary', 'secondary', 'tertiary', 'tertiary-no-outline'] as const
type ButtonType = (typeof buttonTypes)[number]
export const buttonSizes = ['sm', 'md', 'lg'] as const
type ButtonSize = (typeof buttonSizes)[number]

type DsfrButtonProps = {
  onClick: (e: MouseEvent) => void
  title: string
  label?: string
  icon?: {
    name: FrIconClassName
    position: 'left' | 'right'
  }
  'aria-controls'?: ButtonHTMLAttributes['aria-controls']
  disabled?: boolean
  buttonType?: ButtonType
  buttonSize?: ButtonSize
  style?: ButtonHTMLAttributes['style']
  class?: ButtonHTMLAttributes['class']
  type?: ButtonHTMLAttributes['type']
  'aria-pressed'?: ButtonHTMLAttributes['aria-pressed']
}
export const DsfrButton: FunctionalComponent<DsfrButtonProps> = (props: DsfrButtonProps) => {
  const iconClass = []
  if (isNotNullNorUndefined(props.icon)) {
    iconClass.push(props.icon.position === 'left' ? fr.cx('fr-btn--icon-left') : fr.cx('fr-btn--icon-right'))
    iconClass.push(props.icon.name)
  }

  return (
    <button
      class={['fr-btn', ...iconClass, `fr-btn--${props.buttonType ?? 'primary'}`, `fr-btn--${props.buttonSize ?? 'md'}`]}
      disabled={props.disabled ?? false}
      title={props.title}
      aria-label={props.title}
      aria-pressed={props['aria-pressed']}
      aria-controls={props['aria-controls']}
      onClick={props.onClick}
      type={props.type ?? 'button'}
    >
      {isNotNullNorUndefined(props.label) ? props.label : props.title}
    </button>
  )
}

type DsfrButtonIconProps = Omit<DsfrButtonProps, 'icon'> & { icon: FrIconClassName }

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
  breadcrumb?: true
  icon: {
    name: FrIconClassName
    position: 'left' | 'right'
  } | null

  style?: HTMLAttributes['style']
  class?: HTMLAttributes['class']
} & (
  | { to: CaminoVueRoute<T>; disabled: false }
  | { onClick?: () => void; href: HTMLAnchorElement['href']; download?: HTMLAnchorElement['download']; target?: HTMLAnchorElement['target']; rel?: HTMLAnchorElement['rel'] }
)
export const DsfrLink = <T extends CaminoRouteNames>(props: DsfrLinkProps<T>): JSX.Element => {
  const iconClass = []
  if (props.icon !== null && props.label !== null) {
    iconClass.push(fr.cx(`fr-${props.buttonType ? 'btn' : 'link'}--icon-${props.icon.position}`))
  }

  return (
    <>
      {'to' in props ? (
        <CaminoRouterLink
          class={[props.class, props.buttonType ? ['fr-btn', `fr-btn--${props.buttonType ?? 'primary'}`] : 'breadcrumb' in props ? 'fr-breadcrumb__link' : 'fr-link', iconClass, props.icon?.name]}
          isDisabled={props.disabled}
          title={props.title}
          to={props.to}
          style={props.style}
        >
          {isNotNullNorUndefined(props.label) ? props.label : props.title}
        </CaminoRouterLink>
      ) : (
        <a
          class={[props.class, props.buttonType ? [fr.cx('fr-btn'), `fr-btn--${props.buttonType ?? 'primary'}`] : fr.cx('fr-link'), iconClass, fr.cx(props.icon?.name)]}
          title={props.title}
          href={props.href}
          download={props.download}
          target={props.target}
          style={props.style}
          rel={props.rel}
          onClick={props.onClick}
        >
          {isNotNullNorUndefined(props.label) ? props.label : props.title}
        </a>
      )}
    </>
  )
}
