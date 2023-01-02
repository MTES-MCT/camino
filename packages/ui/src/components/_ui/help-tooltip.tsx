import { Icon as IconType } from './iconSpriteType'
import { Icon } from './icon'
import { EmitsOptions, SetupContext } from 'vue'
import styles from './help-tooltip.module.css'

export interface Props {
  icon?: IconType
}

export function HelpTooltip(
  props: Props,
  context: Omit<SetupContext<EmitsOptions>, 'expose'>
): JSX.Element {
  return (
    <div class={styles.tooltip}>
      <h6 class={styles['tooltip-content']}>
        {context.slots.default ? context.slots.default() : null}
      </h6>
      <Icon name={props.icon ?? 'help'} size="M" />
    </div>
  )
}
