import { AsyncData } from '@/api/client-rest'
import { HelpTooltip } from '@/components/_ui/help-tooltip'
import { EmitsOptions, SetupContext } from 'vue'
import styles from './pure-loader.module.css'

export interface Props<T> {
  data: AsyncData<T>
}

export function LoadingElement<T>(
  props: Props<T>,
  context: Omit<SetupContext<EmitsOptions>, 'expose'>
): JSX.Element {
  return (
    <div
      class={styles['top-level']}
      style={
        props.data.status !== 'LOADED'
          ? 'display: flex; justify-content: center'
          : ''
      }
    >
      {props.data.status === 'LOADED' && context.slots.default
        ? context.slots.default({ item: props.data.value })
        : null}
      {props.data.status === 'ERROR' ? (
        <div>
          <HelpTooltip icon="error-warning">{props.data.message}</HelpTooltip>
        </div>
      ) : null}
      {props.data.status === 'LOADING' ? (
        <div class={styles.spinner}></div>
      ) : null}
    </div>
  )
}
