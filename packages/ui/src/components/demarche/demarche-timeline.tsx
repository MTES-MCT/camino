import { capitalize, defineComponent, Fragment, FunctionalComponent, ref } from 'vue'
import { DemarcheGet, DemarcheSlug } from 'camino-common/src/demarche'
import style from './demarche-timeline.module.css'
import { CaminoRouterLink } from '@/router/camino-router-link'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { isNonEmptyArray, isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { CaminoDate, CaminoDateFormated, dateFormat } from 'camino-common/src/date'
import { HTMLAttributes } from 'vue/dist/vue'

type Phase = DemarcheGet['titre']['demarches'][number]
type Props = {
  demarches: DemarcheGet['titre']['demarches']
  currentDemarcheSlug: DemarcheSlug | null
  class?: HTMLAttributes['class']
}

type PhaseWithDateDebut = Omit<Phase, 'demarche_date_debut'> & { demarche_date_debut: CaminoDate; events: Pick<Phase, 'slug' | 'demarche_type_id'>[] }

export const DemarcheTimeline: FunctionalComponent<Props> = props => {
  const phases: PhaseWithDateDebut[] = props.demarches
    .filter((demarche): demarche is PhaseWithDateDebut => isNotNullNorUndefined(demarche.demarche_date_debut))
    .map(phase => ({ ...phase, events: [] }))

  props.demarches.forEach(demarche => {
    if (demarche.first_etape_date === null) return

    const date = demarche.first_etape_date
    if (demarche.demarche_date_debut === null) {
      const phase = phases.find(p => p.demarche_date_debut < date && (isNullOrUndefined(p.demarche_date_fin) || p.demarche_date_fin > date)) ?? phases[0]
      phase.events.push({ slug: demarche.slug, demarche_type_id: demarche.demarche_type_id })
    }
  })

  if (!isNonEmptyArray(phases)) return null

  const datePhases: (CaminoDateFormated | '-')[] = [
    dateFormat(phases[0].demarche_date_debut),
    ...phases.map(phase => (isNotNullNorUndefined(phase.demarche_date_fin) ? dateFormat(phase.demarche_date_fin) : '-')),
  ]

  return (
    <div class={style.timeline}>
      <div class={style.datesContainer}>
        {datePhases.map((datePhase, index) => (
          <div class={`${style.date} fr-text--md fr-mb-1w`} key={index}>
            {datePhase}
          </div>
        ))}
      </div>
      <div class={style.phasesContainer}>
        {phases.map(phase => (
          <Fragment key={phase.slug}>
            <DemarchePhase phase={phase} currentDemarcheSlug={props.currentDemarcheSlug} />
          </Fragment>
        ))}
      </div>
      <div class={`${style.datesContainer} fr-pt-1w`}>
        {phases.map(phase => (
          <div key={phase.slug} style={{ flex: 1 }} class="fr-text--lg fr-m-0">
            {capitalize(DemarchesTypes[phase.demarche_type_id].nom)}
          </div>
        ))}
      </div>
    </div>
  )
}

const getAriaCurrent = (slug: DemarcheSlug, currentPhaseSlug: DemarcheSlug | null): { 'aria-current'?: 'page' } => {
  return slug === currentPhaseSlug ? { 'aria-current': 'page' } : {}
}

const DemarchePhase = defineComponent<{ phase: PhaseWithDateDebut; currentDemarcheSlug: DemarcheSlug | null }>(props => {
  // Impossible d’utiliser du css pour gérer le hover, obliger d’utiliser du javascript
  const isOntoRootElement = ref<boolean>(false)
  const isOntoChildElement = ref<boolean>(false)

  const onMouseenter = () => {
    isOntoRootElement.value = true
  }
  const onMouseleave = () => {
    isOntoRootElement.value = false
  }

  const demarcheEventMouseenter = () => {
    isOntoChildElement.value = true
  }
  const demarcheEventMouseleave = () => {
    isOntoChildElement.value = false
  }

  return () => (
    <CaminoRouterLink
      {...getAriaCurrent(props.phase.slug, props.currentDemarcheSlug)}
      to={{ name: 'demarche', params: { demarcheId: props.phase.slug } }}
      title={capitalize(DemarchesTypes[props.phase.demarche_type_id].nom)}
      class={`${style.phase} ${isOntoRootElement.value && !isOntoChildElement.value ? style.phaseHover : ''}`}
      anchorHTMLAttributes={{ onMouseenter, onMouseleave }}
    >
      {props.phase.events.map((event, index) => (
        <DemarcheEvent onMouseenter={demarcheEventMouseenter} onMouseleave={demarcheEventMouseleave} demarche={event} currentDemarcheSlug={props.currentDemarcheSlug} key={index} />
      ))}
    </CaminoRouterLink>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DemarchePhase.props = ['phase', 'currentDemarcheSlug']

const DemarcheEvent: FunctionalComponent<{
  demarche: Pick<Phase, 'slug' | 'demarche_type_id'>
  onMouseenter: () => void
  onMouseleave: () => void
  currentDemarcheSlug: DemarcheSlug | null
}> = props => {
  const tooltipId = 'timeline-event-' + props.demarche.slug

  return (
    <>
      <CaminoRouterLink
        aria-describedby={tooltipId}
        {...getAriaCurrent(props.demarche.slug, props.currentDemarcheSlug)}
        to={{ name: 'demarche', params: { demarcheId: props.demarche.slug } }}
        title={capitalize(DemarchesTypes[props.demarche.demarche_type_id].nom)}
        class={style.event}
        anchorHTMLAttributes={{ onMouseenter: props.onMouseenter, onMouseleave: props.onMouseleave }}
      />
      {/* FIXME les infos bulles sont dans la dernière version du DSFR */}
      {/* <span class="fr-tooltip fr-placement fr-placement--top fr-tooltip--shown" id={tooltipId} role="tooltip" aria-hidden="true">COUCOU</span> */}
    </>
  )
}
