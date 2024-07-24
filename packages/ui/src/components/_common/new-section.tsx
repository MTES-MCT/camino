import { SectionWithValue } from 'camino-common/src/sections'
import { FunctionalComponent } from 'vue'
import { SectionElement } from './new-section-element'
import type { JSX } from 'vue/jsx-runtime'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'

export const Sections = (props: { sections: SectionWithValue[] }): JSX.Element | null => {
  return props.sections?.length ? (
    <>
      {props.sections.map(s => (
        <NewSection key={s.id} section={s} />
      ))}
    </>
  ) : null
}

interface Props {
  section: SectionWithValue
}
export const NewSection: FunctionalComponent<Props> = (props: Props): JSX.Element => {
  return (
    <div>
      {isNotNullNorUndefinedNorEmpty(props.section.nom) ? <h5 class="fr-m-0 fr-pt-4w">{props.section.nom}</h5> : null}
      {props.section.elements.map(e => (
        <SectionElement class="fr-pt-2w" key={e.id} element={e} />
      ))}
    </div>
  )
}
