import { FunctionalComponent, ButtonHTMLAttributes } from 'vue'

import { Button } from './button'
import { Icon, Size } from './icon'
import type { Icon as IconType } from './iconSpriteType'

type Props = {
  onClick: () => void
  title: string
  icon: IconType
  iconSize?: Size
} & Omit<ButtonHTMLAttributes, 'aria-label'>
/**
 * @deprecated use DsfrButtonIcon
 */
export const ButtonIcon: FunctionalComponent<Props> = (props: Props) => {
  const renderIcon = () => <Icon size={props.iconSize ? props.iconSize : 'M'} name={props.icon} aria-hidden="true" />

  return <Button title={props.title} onClick={props.onClick} render={renderIcon} />
}
