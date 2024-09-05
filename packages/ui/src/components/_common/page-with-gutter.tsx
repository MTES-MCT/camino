import { FunctionalComponent } from 'vue'
import type { JSX } from 'vue/jsx-runtime'
export type Props = {
  content: JSX.Element
}

export const PageWithGutter: FunctionalComponent<Props> = props => {
  return (
    <div class="fr-container fr-pt-3w fr-pb-3w">
            { props.content}
         </div>
  )
}
