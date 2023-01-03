import { Couleur } from 'camino-common/src/static/couleurs'

export interface Props {
  color?: `bg-${Couleur}`
}
export function Dot(props: Props) {
  return <span class={`${props.color ?? 'bg-neutral'} pill dot mr-xs`} />
}
