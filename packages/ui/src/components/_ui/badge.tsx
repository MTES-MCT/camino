import { CouleurIllustrative } from 'camino-common/src/static/couleurs'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { FunctionalComponent, HTMLAttributes } from 'vue'

type BaseProps = { ariaLabel: string; label?: string | number; badgeSize?: 'sm' | 'md' }

export const systemes = ['success', 'error', 'info', 'warning', 'new'] as const
type BadgeColorProps = BaseProps & { badgeColor?: CouleurIllustrative }
type BadgeSystemProps = BaseProps & { systemLevel: (typeof systemes)[number]; systemIcon?: boolean }

type Props = (BadgeColorProps | BadgeSystemProps) & Pick<HTMLAttributes, 'class'>

const isBadgeSystemProps = (props: Props): props is BadgeSystemProps => 'systemLevel' in props

export const Badge: FunctionalComponent<Props> = props => {
  const classes = []

  if (isNotNullNorUndefined(props.class)) {
    classes.push(props.class)
  }
  if (isBadgeSystemProps(props)) {
    classes.push(`fr-badge--${props.systemLevel}`)
    if (!(props.systemIcon ?? false)) {
      classes.push('fr-badge--no-icon')
    }
  } else {
    if (props.badgeColor) {
      classes.push(`fr-badge--${props.badgeColor}`)
    }
  }

  return (
    <p
      style={{ zIndex: 'unset', marginBottom: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
      class={['fr-badge', `fr-badge--${props.badgeSize ?? 'md'}`, ...classes]}
      title={props.ariaLabel}
      aria-label={props.ariaLabel}
    >
      {props.label ?? props.ariaLabel}
    </p>
  )
}
