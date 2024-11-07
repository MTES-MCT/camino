import { DemarcheId } from 'camino-common/src/demarche'
import { CaminoError } from 'camino-common/src/zod-tools'
import { pipe, Effect } from 'effect'
import { Pool } from 'pg'
import { getDemarches, getEtapesByDemarcheId } from '../../api/rest/demarches.queries'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { EtapeId } from 'camino-common/src/etape'
import { updateEtapeFondamentaleId } from '../../database/queries/titres-etapes.queries'
import { EffectDbQueryAndValidateErrors } from '../../pg-database'
import { shortCircuitError } from '../../tools/fp-tools'
import { isNotNullNorUndefinedNorEmpty, toSorted } from 'camino-common/src/typescript-tools'

type EtapesFondamentaleIdUpdateErrors = EffectDbQueryAndValidateErrors
export const etapesFondamentaleIdUpdate = (pool: Pool, demarcheId: DemarcheId): Effect.Effect<number, CaminoError<EtapesFondamentaleIdUpdateErrors>> =>
  pipe(
    getEtapesByDemarcheId(pool, demarcheId),
    Effect.filterOrFail(
      etapes => isNotNullNorUndefinedNorEmpty(etapes),
      () => shortCircuitError("Pas d'étape pour cette démarche")
    ),
    Effect.map(etapes => toSorted(etapes, (a, b) => a.ordre - b.ordre)),
    Effect.map(etapes => {
      const result: { id: EtapeId; oldEtapeFondamentaleId: EtapeId; newEtapeFondamentaleId: EtapeId }[] = []
      let etapeFondamentaleId = etapes[0].id
      for (const currentEtape of etapes) {
        if (EtapesTypes[currentEtape.etape_type_id].fondamentale) {
          etapeFondamentaleId = currentEtape.id
        }
        if (currentEtape.etape_fondamentale_id !== etapeFondamentaleId) {
          result.push({ id: currentEtape.id, newEtapeFondamentaleId: etapeFondamentaleId, oldEtapeFondamentaleId: currentEtape.etape_fondamentale_id })
        }
      }
      return result
    }),
    Effect.flatMap(
      Effect.forEach(etapeToUpdate => {
        console.info(`maj étape fondamentale id ${etapeToUpdate.id} : ${etapeToUpdate.oldEtapeFondamentaleId} --> ${etapeToUpdate.newEtapeFondamentaleId}`)
        return updateEtapeFondamentaleId(pool, etapeToUpdate.id, etapeToUpdate.newEtapeFondamentaleId)
      })
    ),
    Effect.map(etapes => etapes.length),
    Effect.catchTag("Pas d'étape pour cette démarche", _myError => Effect.succeed(0))
  )

export const etapesFondamentaleIdUpdateForAll = (pool: Pool): Effect.Effect<number, CaminoError<EtapesFondamentaleIdUpdateErrors>> =>
  pipe(
    getDemarches(pool),
    Effect.flatMap(Effect.forEach(({ id }) => etapesFondamentaleIdUpdate(pool, id))),
    Effect.map(demarches => demarches.length)
  )
