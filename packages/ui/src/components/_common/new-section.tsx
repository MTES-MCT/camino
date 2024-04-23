import { CaminoDate } from 'camino-common/src/date'
import { SectionWithValue } from 'camino-common/src/sections'
import { FunctionalComponent } from 'vue'
import { SectionElement } from './new-section-element'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'

export const Sections = (props: { sections: SectionWithValue[] }): JSX.Element | null => {
  return props.sections?.length ? (
    <>
      {props.sections.map(s => (
        <NewSection key={s.id} entete={false} section={s} />
      ))}
    </>
  ) : null
}

interface Props {
  entete?: boolean
  section: SectionWithValue
  date?: CaminoDate
}
export const NewSection: FunctionalComponent<Props> = (props: Props): JSX.Element => {
  const entete = props.entete ?? true

  const elements = props.section.elements.filter(
    e =>
      !props.date ||
      // si la date existe, vérifie qu'elle est dans les bornes de l'élément
      ((!e.dateDebut || e.dateDebut < props.date) && (!e.dateFin || e.dateFin >= props.date))
  )

  return (
    <div>
      {isNotNullNorUndefinedNorEmpty(props.section.nom) && entete ? <h4 class="cap-first">{props.section.nom}</h4> : null}

      {elements.map(e => (
        <SectionElement key={e.id} element={e} />
      ))}
    </div>
  )
}
