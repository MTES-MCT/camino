import { Couleur } from 'camino-common/src/static/couleurs'
import { FunctionalComponent, HTMLAttributes } from 'vue'
import styles from './chip.module.css'

export type Props = {
  color?: `bg-${Couleur}`
  nom: string
  onDeleteClicked?: () => void
} & HTMLAttributes

export const Chip: FunctionalComponent<Props, ['onDelete']> = (props, context) => {
  return (
    <button
      class={`${props.color ?? 'bg-neutral'} pl-m pr-m ${styles.chip}`}
      onClick={() => {
        props.onDeleteClicked?.()
        context.emit('onDelete')
      }}
    >
      {props.nom} <span>x</span>
    </button>
  )
}
