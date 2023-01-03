import { Icon as IconType } from './iconSpriteType'
import { Icon } from './icon'
import { FunctionalComponent } from 'vue'
import styles from './help-tooltip.module.css'

export interface Props {
  icon?: IconType
}

export const HelpTooltip: FunctionalComponent<Props> = (
  props,
  context
): JSX.Element => {
  return (
    <div class={styles.tooltip}>
      <h6 class={styles['tooltip-content']}>
        {context.slots.default ? context.slots.default() : null}
      </h6>
      <Icon name={props.icon ?? 'help'} size="M" />
    </div>
  )
}
