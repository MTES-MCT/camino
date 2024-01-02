import { Couleur } from 'camino-common/src/static/couleurs'
import { DomaineId } from 'camino-common/src/static/domaines'
import { capitalize } from 'camino-common/src/strings'
import { FunctionalComponent, HTMLAttributes } from 'vue'

type Props = {
  color?: `bg-${Couleur}` | `bg-domaine-${DomaineId}`
  text: string
  noCapitalize?: boolean
} & HTMLAttributes

export const Pill: FunctionalComponent<Props> = props => {
  let text = capitalize(props.text)
  if (props.noCapitalize) {
    text = props.text
  }

  return <div class={`${props.color ?? 'bg-neutral'} inline-block small bold color-bg pill py-xs px-s`}>{text}</div>
}
