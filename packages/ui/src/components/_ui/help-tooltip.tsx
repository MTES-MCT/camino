import { Icon as IconType } from './iconSpriteType'
import { Icon } from './icon'
import { FunctionalComponent } from 'vue'
import styles from './help-tooltip.module.css'

export interface Props {
  icon?: IconType
  text: string
}

export const HelpTooltip: FunctionalComponent<Props> = (
  props,
  context
): JSX.Element => {
  return (
    <div class={styles.tooltip}>
      <h6 class={styles['tooltip-content']}>{props.text}</h6>
      <Icon name={props.icon ?? 'help'} size="M" />
    </div>
  )
}
