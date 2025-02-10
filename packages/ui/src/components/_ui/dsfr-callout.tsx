import { FunctionalComponent } from 'vue'
import { JSX } from 'vue/jsx-runtime'

type Props = {
  content: JSX.Element
  title: string
  footer: JSX.Element
}

export const DsfrCallout: FunctionalComponent<Props> = props => {
  return (
    <div class="fr-callout fr-icon-information-line">
      <h3 class="fr-callout__title">{props.title}</h3>
      <p class="fr-callout__text">{props.content}</p>
      {props.footer}
    </div>
  )
}
