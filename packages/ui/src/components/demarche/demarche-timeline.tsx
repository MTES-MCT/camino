import { FunctionalComponent } from 'vue'
import { DemarcheGet, DemarcheSlug } from 'camino-common/src/demarche'
import style from './demarche-timeline.module.css'
import { CaminoRouterLink } from '@/router/camino-router-link'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { isNonEmptyArray, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { CaminoDate, CaminoDateFormated, dateFormat } from 'camino-common/src/date'

type Phase = DemarcheGet['titre']['phases'][number]
interface Props {
  demarches: DemarcheGet['titre']['phases']
  currentDemarcheSlug: DemarcheSlug | null
}

// FIXME pb de hover sur les events
// FIXME texte en dessous
// FIXME lien sur les events
// FIXME popup sur les events
// FIXME renommer dans DemarcheGet phases en demarches
export const DemarcheTimeline: FunctionalComponent<Props> = props => {
  const getAriaCurrent = (slug: DemarcheSlug, currentPhaseSlug: DemarcheSlug | null): { 'aria-current'?: 'page' } => {
    return slug === currentPhaseSlug ? { 'aria-current': 'page' } : {}
  }

  const phases = props.demarches.filter((phase): phase is Omit<Phase, 'demarche_date_debut'> & { demarche_date_debut: CaminoDate } => isNotNullNorUndefined(phase.demarche_date_debut))

  if (!isNonEmptyArray(phases)) return null

  const datePhases: (CaminoDateFormated | '-')[] = [
    dateFormat(phases[0].demarche_date_debut),
    ...phases.map(phase => (isNotNullNorUndefined(phase.demarche_date_fin) ? dateFormat(phase.demarche_date_fin) : '-')),
  ]

  return (
    <div>
      <div class={style.datesContainer}>
        {datePhases.map((datePhase, index) => (
          <div class={style.date} key={index}>
            {datePhase}
          </div>
        ))}
      </div>
      <div class={style.phasesContainer}>
        {phases.map(phase => (
          <CaminoRouterLink
            {...getAriaCurrent(phase.slug, props.currentDemarcheSlug)}
            to={{ name: 'demarche', params: { demarcheId: phase.slug } }}
            title={`Démarche ${DemarchesTypes[phase.demarche_type_id].nom}`}
            class={style.phase}
            key={phase.slug}
          >
            <div class={style.event} onMouseover={e => e.preventDefault()}></div>
            <div class={style.event}></div>
            <div class={style.event}></div>
          </CaminoRouterLink>
        ))}
      </div>
    </div>
  )
}
