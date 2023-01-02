import { Couleur } from 'camino-common/src/static/couleurs'
import { SetupContext } from 'vue'
import styles from './chip.module.css'

export interface Props {
  color: `bg-${Couleur}`
  nom: string
}

export function Chip(
  props: Props,
  context: Omit<SetupContext<{ onDelete: () => {} }>, 'expose'>
) {
  return (
    <button
      class={`${props.color ?? 'bg-neutral'} pl-m pr-m ${styles.chip}`}
      onClick={() => context.emit('onDelete')}
    >
      {props.nom} <span>x</span>
    </button>
  )
}
