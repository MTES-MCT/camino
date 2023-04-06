import { Couleur } from 'camino-common/src/static/couleurs'
import { HTMLAttributes } from 'vue'
export interface Props {
  color?: `bg-${Couleur}`
}
export function Dot(props: Props & {class: HTMLAttributes['class']}) {
  return <span class={`${props.color ?? 'bg-neutral'} pill dot mr-xs`} />
}
