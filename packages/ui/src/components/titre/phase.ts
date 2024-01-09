import { CaminoDate } from 'camino-common/src/date'
import { TitreGetDemarche } from 'camino-common/src/titres'

import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { isEtapeStatusOk } from 'camino-common/src/static/etapesStatuts'
import { isEtapeDecision } from 'camino-common/src/static/etapesTypes'
import { isNotNullNorUndefined, isNullOrUndefined, isNullOrUndefinedOrEmpty, OmitDistributive, onlyUnique } from 'camino-common/src/typescript-tools'
import { DemarcheSlug } from 'camino-common/src/demarche'
import { isTravaux } from 'camino-common/src/static/demarchesTypes'

export type TitreTimelineEvents = TitreGetDemarche & { first_etape_date: CaminoDate | null }
export type PhaseWithDateDebut = OmitDistributive<TitreGetDemarche, 'demarche_date_debut'> & { demarche_date_debut: CaminoDate; events: TitreTimelineEvents[] }

export type DemarcheAlteration = TitreGetDemarche & { date_etape_decision_ok: CaminoDate; events: TitreTimelineEvents[] }

export type PhaseWithAlterations = [PhaseWithDateDebut, ...DemarcheAlteration[]][] | [[OmitDistributive<TitreGetDemarche, 'demarche_date_debut'> & { demarche_date_debut: null }]]
export const phaseWithAlterations = (demarches: TitreGetDemarche[], currentDate: CaminoDate): PhaseWithAlterations => {
  if (isNullOrUndefinedOrEmpty(demarches)) {
    return []
  }

  const isPhase = (demarche: TitreGetDemarche): demarche is PhaseWithDateDebut => isNotNullNorUndefined(demarche.demarche_date_debut) && demarche.demarche_date_debut <= currentDate

  const simplePhases: PhaseWithDateDebut[] = demarches.filter(isPhase).map(phase => ({ ...phase, events: [] }))

  const demarchesUsed: DemarcheSlug[] = simplePhases.map(({ slug }) => slug)
  if (isNullOrUndefinedOrEmpty(simplePhases)) {
    if (demarches.length > 1) {
      throw new Error('Le titre a plusieurs démarches sans phases')
    }

    return [[{ ...demarches[0], demarche_date_debut: null }]]
  }

  const phasesWithAlterations: [PhaseWithDateDebut, ...DemarcheAlteration[]][] = simplePhases.map(phase => {
    const demarchesAlterationsForThisPhase = demarches
      .map(demarche => {
        if (!isPhase(demarche) && [DemarchesStatutsIds.Accepte, DemarchesStatutsIds.Termine].includes(demarche.demarche_statut_id)) {
          let demarcheDate = demarche.demarche_date_debut
          if (isNullOrUndefined(demarcheDate)) {
            demarcheDate = [...demarche.etapes].sort((a, b) => b.ordre - a.ordre).find(etape => isEtapeDecision(etape.etape_type_id) && isEtapeStatusOk(etape.etape_statut_id))?.date ?? null
          }

          if (isNotNullNorUndefined(demarcheDate) && demarcheDate > phase.demarche_date_debut && (isNullOrUndefined(phase.demarche_date_fin) || demarcheDate <= phase.demarche_date_fin)) {
            return { ...demarche, date_etape_decision_ok: demarcheDate }
          }
        }

        return null
      })
      .filter(isNotNullNorUndefined)
    const foundAlterations = demarchesAlterationsForThisPhase.map(demarche => ({ ...demarche, events: [] }))
    demarchesUsed.push(...foundAlterations.map(({ slug }) => slug))
    return [phase, ...foundAlterations]
  })

  demarches.forEach(demarche => {
    if (isNotNullNorUndefined(demarche.etapes) && (isTravaux(demarche.demarche_type_id) || ![DemarchesStatutsIds.Accepte, DemarchesStatutsIds.Termine].includes(demarche.demarche_statut_id))) {
      const first_etape_date = demarche.etapes.length > 0 ? demarche.etapes[0].date : null
      if (!isPhase(demarche)) {
        if (first_etape_date === null) {
          const latestPhaseWithAlterations = phasesWithAlterations[phasesWithAlterations.length - 1]
          const latestAlterations = latestPhaseWithAlterations[latestPhaseWithAlterations.length - 1]
          latestAlterations.events.push({ ...demarche, first_etape_date: null })
          demarchesUsed.push(demarche.slug)
        } else {
          const phaseWithAlterations: [PhaseWithDateDebut, ...DemarcheAlteration[]] =
            phasesWithAlterations.find(p => p[0].demarche_date_debut < first_etape_date && (isNullOrUndefined(p[0].demarche_date_fin) || p[0].demarche_date_fin > first_etape_date)) ??
            phasesWithAlterations[0]

          const found = [...phaseWithAlterations].reverse().find(stuff => {
            return (
              ('date_etape_decision_ok' in stuff && stuff.date_etape_decision_ok < first_etape_date) ||
              ('demarche_date_debut' in stuff && isNotNullNorUndefined(stuff.demarche_date_debut) && stuff.demarche_date_debut < first_etape_date)
            )
          })
          if (isNotNullNorUndefined(found)) {
            found.events.push({ ...demarche, first_etape_date })
            demarchesUsed.push(demarche.slug)
          } else {
            console.error('impossibruh', first_etape_date)
            console.error('impossibruh', phasesWithAlterations)
          }
        }
      }
    }
  })

  if (demarchesUsed.length !== demarches.length) {
    const demarchesToAdd = demarches.map(({ slug }) => slug).filter(slug => !demarchesUsed.includes(slug))
    console.error(
      "On a exclu des démarches, on les rajoute à la fin 'sauvagement'",
      demarches.map(({ slug }) => slug).filter(slug => !demarchesUsed.includes(slug))
    )

    const latestPhaseWithAlterations = phasesWithAlterations[phasesWithAlterations.length - 1]
    const latestAlterations = latestPhaseWithAlterations[latestPhaseWithAlterations.length - 1]
    demarchesToAdd.forEach(slugMissing => {
      const demarcheFound = demarches.find(({ slug }) => slug === slugMissing)
      if (isNullOrUndefined(demarcheFound)) {
        throw new Error('Cas impossible, on cherche une démarche et on ne la trouve pas')
      }
      latestAlterations.events.push({ ...demarcheFound, first_etape_date: null })
    })
  }

  return phasesWithAlterations
}
