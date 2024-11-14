import { EtapeId } from 'camino-common/src/etape'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Pool } from 'pg'
import { getAllDemandesProcedureSpecifique, getDemandesPotentialConcurrence, getEtapeById } from '../../api/rest/etapes.queries'
import {
  miseEnConcurrence,
  MiseEnConcurrenceErrors,
  updateEtapeIdDeMiseEnConcurrence as updateDemarcheIdDeMiseEnConcurrence,
  UpdateEtapeIdDeMiseEnConcurrenceErrors,
} from './titres-etapes-mise-en-concurrence.queries'
import { Effect, pipe } from 'effect'
import { CaminoError } from 'camino-common/src/zod-tools'
import { DBNotFound } from '../../pg-database'
import { shortCircuitError } from '../../tools/fp-tools'
import { DemarcheId } from 'camino-common/src/demarche'

export const etapeMiseEnConcurrenceUpdate = (
  pool: Pool,
  etapeId: EtapeId
): Effect.Effect<DemandeMiseEnConcurrenceUpdateResult | null, CaminoError<DBNotFound | MiseEnConcurrenceErrors | UpdateEtapeIdDeMiseEnConcurrenceErrors>> => {
  return pipe(
    getDemandesPotentialConcurrence(pool),
    Effect.flatMap(values => demandeMiseEnConcurrenceUpdate(pool, etapeId, values))
  )
}

type DemandeMiseEnConcurrenceUpdateResult = { etapeId: EtapeId; old: DemarcheId | null; new: DemarcheId | null }
const demandeMiseEnConcurrenceUpdate = (
  pool: Pool,
  etapeId: EtapeId,
  allDemandesPotentialConcurrence: EtapeId[]
): Effect.Effect<DemandeMiseEnConcurrenceUpdateResult | null, CaminoError<DBNotFound | MiseEnConcurrenceErrors | UpdateEtapeIdDeMiseEnConcurrenceErrors>> => {
  return pipe(
    getEtapeById(pool, etapeId),
    Effect.filterOrFail(
      etape => isNotNullNorUndefined(etape.demarche_id_en_concurrence) || allDemandesPotentialConcurrence.includes(etapeId),
      etape => shortCircuitError('Étape non concernée par la mise en concurrence', etape)
    ),

    Effect.flatMap(etape =>
      Effect.if(allDemandesPotentialConcurrence.includes(etapeId), {
        onFalse: () => Effect.succeed(null),
        onTrue: () =>
          pipe(
            miseEnConcurrence(pool, etape.etape_id),
            Effect.filterOrFail(
              demarcheEnConcurrence => isNotNullNorUndefined(demarcheEnConcurrence) || isNotNullNorUndefined(etape.demarche_id_en_concurrence),
              () => shortCircuitError('Pas de démarche en concurrence', etape)
            )
          ),
      })
    ),
    Effect.flatMap(demarcheConcurrence => updateDemarcheIdDeMiseEnConcurrence(pool, etapeId, demarcheConcurrence?.id ?? null)),
    Effect.tap(result => {
      if (result.old !== result.new) {
        console.info(`maj démarche concurrente pour l'étape ${etapeId}: old: ${result.old}, new: ${result.new}`)
      }
    }),
    Effect.map(value => ({ etapeId, ...value })),
    Effect.catchTag('Pas de démarche en concurrence', () => Effect.succeed(null)),
    Effect.catchTag('Étape non concernée par la mise en concurrence', () => Effect.succeed(null))
  )
}

export const allEtapesMiseEnConcurrenceUpdate = (
  pool: Pool
): Effect.Effect<DemandeMiseEnConcurrenceUpdateResult[], CaminoError<UpdateEtapeIdDeMiseEnConcurrenceErrors | DBNotFound | MiseEnConcurrenceErrors>> => {
  console.info('mise en concurrence des étapes…')
  return Effect.Do.pipe(
    Effect.bind('etapes', () => getAllDemandesProcedureSpecifique(pool)),
    Effect.bind('allDemandesPotentialConcurrence', () => getDemandesPotentialConcurrence(pool)),
    Effect.flatMap(({ allDemandesPotentialConcurrence, etapes }) => Effect.forEach(etapes, etapeId => demandeMiseEnConcurrenceUpdate(pool, etapeId, allDemandesPotentialConcurrence))),
    Effect.map(results => results.filter(isNotNullNorUndefined))
  )
}
