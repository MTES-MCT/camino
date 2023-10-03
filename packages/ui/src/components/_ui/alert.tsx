import { FunctionalComponent, HTMLAttributes } from 'vue'

interface Props {
  type: 'warning' | 'success' | 'error' | 'info'
  title: string
  description?: () => JSX.Element
  small?: boolean
}

export const Alert: FunctionalComponent<Props & HTMLAttributes['class']> = props => {
  const small = !!props.small

  return (
    <div class={['fr-alert', `fr-alert--${props.type}`, small ? 'fr-alert--sm' : undefined]}>
      <h3 class="fr-alert__title">{props.title}</h3>
      {props.description ? props.description() : null}
    </div>
  )
}
