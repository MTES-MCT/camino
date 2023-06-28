import type { Icon as IconType } from './iconSpriteType'
import { FunctionalComponent, HTMLAttributes } from 'vue'

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
