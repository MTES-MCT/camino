import { fr } from '@codegouvfr/react-dsfr'
import { FunctionalComponent } from 'vue'
import { JSX } from 'vue/jsx-runtime'

interface Props {
  id: string
  title: string
  content: JSX.Element
  expandedByDefault: boolean
}

export const DsfrAccordion: FunctionalComponent<Props> = (props: Props) => {
  return (
    <section class={fr.cx('fr-accordion')}>
      <div class={fr.cx('fr-accordion__title')}>
        <button class={fr.cx('fr-accordion__btn')} aria-expanded={props.expandedByDefault} aria-controls={props.id}>
          {props.title}
        </button>
      </div>
      <div class={fr.cx('fr-collapse')} id={props.id}>
        {props.content}
      </div>
    </section>
  )
}
