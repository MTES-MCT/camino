import { capitalize } from 'camino-common/src/strings'
import { HTMLAttributes, FunctionalComponent } from 'vue'
import type { JSX } from 'vue/jsx-runtime'

type ItemProp = {
  item: JSX.Element
}
type TextProp = {
  text: string
}
type Props = (TextProp | ItemProp) & {
  title: string
  style?: HTMLAttributes['style']
}
export const LabelWithValue: FunctionalComponent<Props> = props => {
  return (
    <div class="fr-grid-row">
      <span class="fr-col-3 fr-h6" style={{ margin: 0 }}>
        {capitalize(props.title)}
      </span>
      <span class="fr-col">{'text' in props ? <>{capitalize(props.text)}</> : <>{props.item}</>}</span>
    </div>
  )
}
