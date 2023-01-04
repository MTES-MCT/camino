import type { Icon as IconType } from './iconSpriteType'
import { HTMLAttributes } from 'vue'

export type Size = 'S' | 'M'
export type Props = {
  name: IconType
  size: Size
  color?: string
} & HTMLAttributes

const heightAndWidth = (size?: Size): '16px' | '24px' => {
  switch (size) {
    case 'S':
      return '16px'
    case 'M':
      return '24px'
  }
  return '24px'
}

export function Icon(props: Props): JSX.Element {
  const size = heightAndWidth(props.size)
  return (
    <svg
      style="display: block"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-labelledby={props.name}
      role="application"
      fill={props.color ?? '#666'}
      tabindex="-1"
    >
      <use href={`#icon-${props.name}`} />
    </svg>
  )
}
