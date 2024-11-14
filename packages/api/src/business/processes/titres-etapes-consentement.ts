import { EtapeId } from 'camino-common/src/etape'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Pool } from 'pg'
import { getAllDemandesProcedureSpecifique } from '../../api/rest/etapes.queries'
import { Effect, pipe } from 'effect'
import { CaminoError } from 'camino-common/src/zod-tools'
import { DBNotFound, DbQueryAccessError } from '../../pg-database'
import { shortCircuitError, ZodUnparseable } from '../../tools/fp-tools'
import { DemarcheId } from 'camino-common/src/demarche'
import { getEtapeConsentement, updateEtapeConsentement } from './titres-etapes-consentement.queries'
import { DOMAINES_IDS } from 'camino-common/src/static/domaines'
import { getDomaineId } from 'camino-common/src/static/titresTypes'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'

type EtapeConsentementUpdateResult = { etapeId: EtapeId; old: DemarcheId[]; new: DemarcheId[] }
export const etapeConsentementUpdate = (pool: Pool, etapeId: EtapeId): Effect.Effect<EtapeConsentementUpdateResult | null, CaminoError<DBNotFound | DbQueryAccessError | ZodUnparseable>> => {
  return pipe(
    getEtapeConsentement(pool, etapeId),
    Effect.filterOrFail(
      (etape): etape is NonNullable<typeof etape> => isNotNullNorUndefined(etape) && getDomaineId(etape.titre_type_id) === DOMAINES_IDS.METAUX && etape.type_id === ETAPES_TYPES.demande,
      etape => shortCircuitError('Étape non concernée par le consentement', etape)
    ),
    Effect.flatMap(etape => updateEtapeConsentement(pool, etape.id, etape.date, etape.geojson4326_perimetre, etape.substances, etape.demarche_ids_consentement)),
    Effect.catchTag('Étape non concernée par le consentement', () => Effect.succeed(null))
  )
}

export const allEtapesConsentementUpdate = (pool: Pool): Effect.Effect<EtapeConsentementUpdateResult[], CaminoError<DBNotFound | DbQueryAccessError | ZodUnparseable>> => {
  console.info('consentement des étapes…')
  return pipe(
    getAllDemandesProcedureSpecifique(pool),
    Effect.flatMap(etapes => Effect.forEach(etapes, etapeId => etapeConsentementUpdate(pool, etapeId))),
    Effect.map(results => results.filter(isNotNullNorUndefined))
  )
}
