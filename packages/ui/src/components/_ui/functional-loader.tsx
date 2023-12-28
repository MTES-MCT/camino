import { AsyncData } from '@/api/client-rest'
import { HelpTooltip } from '@/components/_ui/help-tooltip'
import { HTMLAttributes } from 'vue'
import styles from './functional-loader.module.css'

type Props<T> = {
  data: AsyncData<T>
  renderItem: (item: T) => JSX.Element | null
} & HTMLAttributes

export const LoadingElement = <T,>(props: Props<T>) => {
  return (
    <>
      {props.data.status === 'LOADED' ? (
        props.renderItem(props.data.value)
      ) : (
        <div class={`${props.data.status === 'LOADING' ? styles['top-level'] : ''}`} style={'display: flex; justify-content: center'}>
          {props.data.status === 'ERROR' ? (
            <div>
              <HelpTooltip icon="error-warning" text={props.data.message} />
            </div>
          ) : null}
          {props.data.status === 'LOADING' ? <div class={styles.spinner}></div> : null}
        </div>
      )}
    </>
  )
}
