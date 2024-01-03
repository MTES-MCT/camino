import { capitalize, defineComponent, Fragment, FunctionalComponent, ref } from 'vue'
import { DemarcheSlug } from 'camino-common/src/demarche'
import style from './titre-timeline.module.css'
import { CaminoRouterLink } from '@/router/camino-router-link'
import { DemarchesTypes, isTravaux } from 'camino-common/src/static/demarchesTypes'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { CaminoDate, CaminoDateFormated, dateFormat } from 'camino-common/src/date'
import { HTMLAttributes } from 'vue/dist/vue'
import { TitreGetDemarche, TitreSlug } from 'camino-common/src/titres'
import { DsfrSeparator } from '../_ui/dsfr-separator'
import { TravauxIcone } from './travaux-icone'

type NoPhase = [[Pick<PhaseWithDateDebut, 'slug' | 'demarche_type_id'> & { demarche_date_debut: null }]]
export type Phase = [PhaseWithDateDebut, ...DemarcheAlteration[]][]
type TitreTimelineEvents = Pick<TitreGetDemarche, 'slug' | 'demarche_type_id'> & { first_etape_date: CaminoDate | null }
type Props = {
  titreSlug: TitreSlug
  phasesWithAlterations: Phase | NoPhase
  currentDemarcheSlug: DemarcheSlug
  class?: HTMLAttributes['class']
}

type PhaseWithDateDebut = Pick<TitreGetDemarche, 'slug' | 'demarche_type_id' | 'demarche_date_fin'> & {
  demarche_date_debut: CaminoDate
  events: TitreTimelineEvents[]
}

type DemarcheAlteration = Pick<TitreGetDemarche, 'slug' | 'demarche_type_id'> & {
  date_etape_decision_ok: CaminoDate
  events: TitreTimelineEvents[]
}

const isNoPhase = (phase: Phase | NoPhase): phase is NoPhase => {
  return phase.length === 1 && phase[0].length === 1 && phase[0][0].demarche_date_debut === null
}

const minWidth = 200

export const TitreTimeline: FunctionalComponent<Props> = props => {
  if (props.phasesWithAlterations.length === 0 || isNoPhase(props.phasesWithAlterations)) {
    return null
  }
  props.phasesWithAlterations.forEach(phaseWithAlteration => {
    phaseWithAlteration.forEach(phase => phase.events.sort((a, b) => (a.first_etape_date ?? '').localeCompare(b.first_etape_date ?? '')))
  })

  const lastPhaseWithDateFin = props.phasesWithAlterations[props.phasesWithAlterations.length - 1][0]
  const dateFin = isNotNullNorUndefined(lastPhaseWithDateFin.demarche_date_fin) ? dateFormat(lastPhaseWithDateFin.demarche_date_fin) : 'xx-xx-xxxx'
  const datePhasesWithAlterations: (CaminoDateFormated | 'xx-xx-xxxx')[][] = [
    ...props.phasesWithAlterations.map(phaseWithAlterations => {
      return phaseWithAlterations.map(stuff => {
        if ('date_etape_decision_ok' in stuff) {
          return dateFormat(stuff.date_etape_decision_ok)
        } else {
          return dateFormat(stuff.demarche_date_debut)
        }
      })
    }),
  ]

  return (
    <>
      <h2>Phases</h2>
      <div style={{ overflowX: 'auto' }}>
        <div class="fr-mx-4w">
          <div style={{ display: 'flex', gap: '14px' }}>
            {datePhasesWithAlterations.map((datePhases, i) => (
              <div key={i} style={{ flex: 1, minWidth: datePhases.length * (minWidth + 2) + 1 + 'px' }} class={`${style.datesContainer}`}>
                {datePhases.map((datePhase, index) => (
                  <div
                    class={`${style.date} fr-text--md fr-mb-1w`}
                    style={{
                      flex: index !== 0 ? 2 : 1,
                      justifyContent: index !== 0 ? 'center' : 'start',
                    }}
                    key={index}
                  >
                    <span
                      style={{
                        marginLeft: index !== 0 ? 0 : i === 0 ? '-32px' : '-40px',
                      }}
                    >
                      {datePhase}
                    </span>
                  </div>
                ))}

                {i === datePhasesWithAlterations.length - 1 ? (
                  <div
                    class={`${style.date} fr-text--md fr-mb-1w`}
                    style={{
                      justifyContent: 'end',
                      flex: 1,
                      minWidth: `${minWidth / 2}px`,
                    }}
                  >
                    <span
                      style={{
                        marginRight: '-32px',
                      }}
                    >
                      {dateFin}
                    </span>
                  </div>
                ) : (
                  <div style={{ flex: 1 }}></div>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', width: '100%' }}>
            <div style={{ display: 'flex', gap: '5px', position: 'relative', height: '20px', flex: 1 }}>
              {props.phasesWithAlterations.map((phaseWithAlterations, index) => (
                <Fragment key={index}>
                  <div class={`${style.phasesContainer}`} style={{ flex: 1 }}>
                    {phaseWithAlterations.map(demarche => (
                      <Fragment key={demarche.slug}>
                        <DemarchePhase titreSlug={props.titreSlug} phase={demarche} currentDemarcheSlug={props.currentDemarcheSlug} />
                      </Fragment>
                    ))}
                  </div>
                  {index !== props.phasesWithAlterations.length - 1 ? <div style={{ border: '2px solid black' }}></div> : null}
                </Fragment>
              ))}
            </div>
            <div
              style={{
                border: 'solid var(--background-action-high-blue-france)',
                borderWidth: '0 4px 4px 0',
                padding: '8px',
                display: 'inline-block',
                transform: 'rotate(-45deg)',
                marginLeft: '-20px',
              }}
            ></div>
          </div>
          <div class="fr-pt-1w" style={{ display: 'flex', columnGap: '14px' }}>
            {props.phasesWithAlterations.map(phaseWithAlterations => (
              <div style={{ flex: 1 }} class={`${style.datesContainer}`}>
                {phaseWithAlterations.map(demarche => (
                  <div style={{ flex: 1, minWidth: `${minWidth}px` }}>
                    <CaminoRouterLink
                      {...getAriaCurrent(demarche.slug, props.currentDemarcheSlug)}
                      key={demarche.slug}
                      to={{ name: 'titre', params: { id: props.titreSlug }, query: { demarcheSlug: demarche.slug } }}
                      title={capitalize(DemarchesTypes[demarche.demarche_type_id].nom)}
                      class="fr-link"
                    >
                      {capitalize(DemarchesTypes[demarche.demarche_type_id].nom)}
                    </CaminoRouterLink>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <DsfrSeparator />
    </>
  )
}

const getAriaCurrent = (slug: DemarcheSlug, currentPhaseSlug: DemarcheSlug | null): { 'aria-current'?: 'page' } => {
  return slug === currentPhaseSlug ? { 'aria-current': 'page' } : {}
}

const DemarchePhase = defineComponent<{
  titreSlug: TitreSlug
  phase: PhaseWithDateDebut | DemarcheAlteration
  currentDemarcheSlug: DemarcheSlug
}>(props => {
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
      to={{ name: 'titre', params: { id: props.titreSlug }, query: { demarcheSlug: props.phase.slug } }}
      title={capitalize(DemarchesTypes[props.phase.demarche_type_id].nom)}
      style={{ minWidth: `${minWidth}px` }}
      class={`${style.phase} ${isOntoRootElement.value && !isOntoChildElement.value ? style.phaseHover : ''}`}
      anchorHTMLAttributes={{ onMouseenter, onMouseleave }}
    >
      {props.phase.events.map((event, index) => (
        <DemarcheEvent
          titreSlug={props.titreSlug}
          onMouseenter={demarcheEventMouseenter}
          onMouseleave={demarcheEventMouseleave}
          demarche={event}
          currentDemarcheSlug={props.currentDemarcheSlug}
          key={index}
        />
      ))}
    </CaminoRouterLink>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DemarchePhase.props = ['phase', 'currentDemarcheSlug', 'titreSlug']

const DemarcheEvent: FunctionalComponent<{
  titreSlug: TitreSlug
  demarche: Pick<TitreGetDemarche, 'slug' | 'demarche_type_id'>
  onMouseenter: () => void
  onMouseleave: () => void
  currentDemarcheSlug: DemarcheSlug | null
}> = props => {
  const tooltipId = 'timeline-event-' + props.demarche.slug

  const commonProps = {
    'aria-describedby': tooltipId,
    ...getAriaCurrent(props.demarche.slug, props.currentDemarcheSlug),
    to: { name: 'titre', params: { id: props.titreSlug }, query: { demarcheSlug: props.demarche.slug } },
    title: capitalize(DemarchesTypes[props.demarche.demarche_type_id].nom),
    anchorHTMLAttributes: { onMouseenter: props.onMouseenter, onMouseleave: props.onMouseleave },
  }

  return (
    <>
      {isTravaux(props.demarche.demarche_type_id) ? (
        <CaminoRouterLink {...commonProps}>
          <TravauxIcone selected={props.demarche.slug === props.currentDemarcheSlug} />
        </CaminoRouterLink>
      ) : (
        <CaminoRouterLink {...commonProps} class={style.event} />
      )}
    </>
  )
}
