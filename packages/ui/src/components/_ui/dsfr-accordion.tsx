import { random } from '@/utils/vue-tsx-utils'
import { FunctionalComponent } from 'vue'
import { JSX } from 'vue/jsx-runtime'

interface Props {
  title: string
  content: JSX.Element
  expandedByDefault: boolean
}

export const DsfrAccordion: FunctionalComponent<Props> = (props: Props) => {
  const id = `accordion-${(random() * 1000).toFixed()}`
  return (
    <section class="fr-accordion">
      <h3 class="fr-accordion__title">
        <button class="fr-accordion__btn" aria-expanded={props.expandedByDefault} aria-controls={id}>
          {props.title}
        </button>
      </h3>
      <div class="fr-collapse" id={id}>
        {props.content}
      </div>
    </section>
  )
}
