import { Couleur } from 'camino-common/src/static/couleurs'
import { FunctionalComponent, HTMLAttributes } from 'vue'
import styles from './chip.module.css'

type Props = {
  color?: `bg-${Couleur}`
  nom: string
  onDeleteClicked: () => void
} & HTMLAttributes

export const Chip: FunctionalComponent<Props, ['onDelete']> = props => {
  return (
    <button
      class={`${props.color ?? 'bg-neutral'} pl-m pr-m ${styles.chip}`}
      onClick={() => {
        props.onDeleteClicked()
      }}
    >
      {props.nom} <span>x</span>
    </button>
  )
}
