import { CaminoDate } from 'camino-common/src/date'
import { Section as ISection } from 'camino-common/src/titres'
import { FunctionalComponent } from 'vue'
import { SectionElement } from './new-section-element'

export const Sections = (props: { sections: ISection[] }): JSX.Element | null => {
  return props.sections?.length ? (
    <>
      {props.sections.map(s => (
        <NewSection key={s.id} entete={false} section={s} fileDownload={() => ({})} />
      ))}
    </>
  ) : null
}

interface Props {
  entete?: boolean
  section: ISection
  date?: CaminoDate
  fileDownload: (file: string) => void
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
      {props.section.nom && entete ? <h4 class="cap-first">{props.section.nom}</h4> : null}

      {elements.map(e => (
        <SectionElement key={e.id} element={e} fileDownload={props.fileDownload} />
      ))}
    </div>
  )
}
