import { AsyncData } from '@/api/client-rest'
import { HelpTooltip } from '@/components/_ui/help-tooltip'
import styles from './functional-loader.module.css'

export interface Props<T> {
  data: AsyncData<T>
  renderItem: (item: T) => JSX.Element
}

export const LoadingElement = <T,>(props: Props<T>) => {
  return (
    <div
      class={styles['top-level']}
      style={
        props.data.status !== 'LOADED'
          ? 'display: flex; justify-content: center'
          : ''
      }
    >
      {props.data.status === 'LOADED'
        ? props.renderItem(props.data.value)
        : null}
      {props.data.status === 'ERROR' ? (
        <div>
          <HelpTooltip icon="error-warning" text={props.data.message} />
        </div>
      ) : null}
      {props.data.status === 'LOADING' ? (
        <div class={styles.spinner}></div>
      ) : null}
    </div>
  )
}
