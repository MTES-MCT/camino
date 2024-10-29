import { FunctionalComponent } from 'vue'
import type { JSX } from 'vue/jsx-runtime'
type Props = {
  content: JSX.Element
  filtres: JSX.Element
}

export const PageWithFilters: FunctionalComponent<Props> = props => {
  return (
    <div class="fr-container--fluid" style={{ overflow: 'visible' }}>
      <div class="fr-grid-row">
        <div class="fr-col-12 fr-col-md-3">{props.filtres}</div>

        <div class="fr-col-12 fr-col-md-9 fr-pt-3w fr-pr-2w fr-pb-3w">{props.content}</div>
      </div>
    </div>
  )
}
