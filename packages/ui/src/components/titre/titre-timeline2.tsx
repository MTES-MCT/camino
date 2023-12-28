import { FunctionalComponent, HTMLAttributes } from 'vue'
// import './titre-timeline2.css'
import styles from './titre-timeline2.module.css'
import { TitreGetDemarche, TitreSlug } from 'camino-common/src/titres'
import { CaminoDate, CaminoDateFormated, dateFormat } from 'camino-common/src/date'
import { DemarcheSlug } from 'camino-common/src/demarche'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

type PhaseWithDateDebut = Pick<TitreGetDemarche, 'slug' | 'demarche_type_id' | 'demarche_date_fin'> & { demarche_date_debut: CaminoDate; events: TitreTimelineEvents[] }

type DemarcheAlteration = Pick<TitreGetDemarche, 'slug' | 'demarche_type_id'> & { date_etape_decision_ok: CaminoDate; events: TitreTimelineEvents[] }
export type NoPhase = [[Pick<PhaseWithDateDebut, 'slug' | 'demarche_type_id'> & { demarche_date_debut: null }]]
export type Phase = [PhaseWithDateDebut, ...DemarcheAlteration[]][]
type TitreTimelineEvents = Pick<TitreGetDemarche, 'slug' | 'demarche_type_id'> & { first_etape_date: CaminoDate | null }

type Props = {
  titreSlug: TitreSlug
  phasesWithAlterations: Phase | NoPhase
  currentDemarcheSlug: DemarcheSlug
  class?: HTMLAttributes['class']
}

const isNoPhase = (phase: Phase | NoPhase): phase is NoPhase => {
  return phase.length === 1 && phase[0].length === 1 && phase[0][0].demarche_date_debut === null
}

export const TitreTimeline2: FunctionalComponent<Props> = props => {
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
  const templateColumn = props.phasesWithAlterations.map(_ => 'repeat(3, minmax(50px, 1fr))').join(' 0fr ')

  const gridTemplateFirstRow = props.phasesWithAlterations
    .slice(1)
    .map((_, index) => `. datemiddle${index} datemiddle${index} datemiddle${index} .`)
    .join(' ')
  console.log('gridTemplateFirstRow', gridTemplateFirstRow)
  console.log('templateColumn', templateColumn)

  return (
    <div
      style={{
        overflowX: 'auto',
        display: 'grid',
        gridTemplateColumns: `0.2fr ${templateColumn} 0.2fr`,
        gridTemplateRows: '1fr 1fr 1fr',
        gap: '0px 5px',
        gridTemplateAreas: `
      "datestart datestart . datemiddle1 datemiddle1 datemiddle1 . dateend dateend"
      ". timeline1 timeline1 timeline1 separation1 timeline2 timeline2 timeline2 arrow"
      ". texttimeline1 texttimeline1 texttimeline1 . texttimeline2 texttimeline2 texttimeline2 ."`,
      }}
    >
      <div class={[styles['timeline-common']]} style={{ gridArea: 'timeline1' }}></div>
      <div class={[styles.separation]} style={{ gridArea: 'separation1' }}></div>
      <div class={[styles['timeline-common']]} style={{ gridArea: 'timeline2' }}></div>
      <div class={[styles['datemiddle-common']]} style={{ gridArea: 'datemiddle1' }}>
        2023-12-28
      </div>
      <div style={{ gridArea: 'datestart', textAlign: 'left' }}>{datePhasesWithAlterations[0][0]}</div>
      <div style={{ gridArea: 'dateend', textAlign: 'right' }}>{dateFin}</div>
      <div style={{ gridArea: 'texttimeline1' }}>Octroi</div>
      <div style={{ gridArea: 'texttimeline2' }}>Prolongation</div>
      <div class={[styles.arrow]}></div>
    </div>
  )
}
