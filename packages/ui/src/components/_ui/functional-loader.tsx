import { AsyncData } from '@/api/client-rest'
import { HTMLAttributes } from 'vue'
import styles from './functional-loader.module.css'
import type { JSX } from 'vue/jsx-runtime'
import { Alert } from './alert'
type Props<T> = {
  data: AsyncData<T>
  renderItem: (item: T) => JSX.Element | null
} & Pick<HTMLAttributes, 'class' | 'style'>

export const LoadingElement = <T,>(props: Props<T>): JSX.Element => {
  return (
    <>
      {props.data.status === 'LOADED' ? (
        props.renderItem(props.data.value)
      ) : (
        <div class={`${props.data.status === 'LOADING' ? styles['top-level'] : ''} ${props.class}`} style={'display: flex; justify-content: center'}>
          {props.data.status === 'ERROR' ? <Alert small={true} title={props.data.message} type="error" /> : null}
          {props.data.status === 'LOADING' ? <div class={styles.spinner}></div> : null}
        </div>
      )}
    </>
  )
}
