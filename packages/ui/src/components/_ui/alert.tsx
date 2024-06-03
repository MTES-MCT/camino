import type { FunctionalComponent, HTMLAttributes } from 'vue'
import type { JSX } from 'vue/jsx-runtime'
type SmallProps = {
  small: true
}
type ClassicProps = {
  description?: string | JSX.Element
}

type Props = {
  type: 'warning' | 'success' | 'error' | 'info'
  title: string | JSX.Element
} & (SmallProps | ClassicProps) & { class?: HTMLAttributes['class'] }

export const Alert: FunctionalComponent<Props> = props => {
  if ('small' in props) {
    return (
      <div class={['fr-alert', `fr-alert--${props.type}`, 'fr-alert--sm']}>
        <p>{props.title}</p>
      </div>
    )
  } else {
    return (
      <div class={['fr-alert', `fr-alert--${props.type}`]}>
        <h3 class="fr-alert__title">{props.title}</h3>
        {props.description !== undefined ? props.description : null}
      </div>
    )
  }
}

export const PageIntrouvableAlert: FunctionalComponent = () => {
  return <Alert type="error" title="Page Introuvable" small={true} />
}
// Demandé par le router car utilisé dans un import asynchrone /shrug
PageIntrouvableAlert.displayName = 'Page introuvable'
