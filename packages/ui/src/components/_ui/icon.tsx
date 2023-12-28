import type { Icon as IconType } from './iconSpriteType'
import type { DsfrIcon as DsfrIconType } from './dsfrIconSpriteType'
import { FunctionalComponent, HTMLAttributes } from 'vue'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

export type Size = 'S' | 'M'
export type Props = {
  name: IconType
  size: Size
  color?: string
} & Omit<HTMLAttributes, 'aria-hidden' | 'aria-label' | 'role'> &
  ({ 'aria-hidden': 'true' } | { role: 'img'; 'aria-label': string })

const heightAndWidth = (size?: Size): '16px' | '24px' => {
  switch (size) {
    case 'S':
      return '16px'
    case 'M':
      return '24px'
  }

  return '24px'
}

export const Icon: FunctionalComponent<Props> = (props: Props): JSX.Element => {
  const size = heightAndWidth(props.size)

  return (
    <svg style="display: block" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={props.color ?? '#666'}>
      <use href={`#icon-${props.name}`} />
    </svg>
  )
}

export type DsfrIconProps = {
  name: DsfrIconType
  size?: 'sm' | 'md' | 'lg'
  color?: 'text-title-blue-france'
} & Pick<HTMLAttributes, 'class'>

export const DsfrIcon: FunctionalComponent<DsfrIconProps> = (props): JSX.Element => {
  const iconClass = props.size ? `fr-icon--${props.size}` : null

  return <span class={[props.name, iconClass]} aria-hidden="true" style={{ color: isNotNullNorUndefined(props.color) ? `var(--${props.color})` : '' }} />
}
