import { EtapeId, etapeIdValidator } from 'camino-common/src/etape'
import { CaminoError } from 'camino-common/src/zod-tools'
import { Effect, pipe } from 'effect'
import { Pool } from 'pg'
import { DBNotFound, dbNotFoundError, DbQueryAccessError, effectDbQueryAndValidate, Redefine } from '../../pg-database'
import { z } from 'zod'
import { DemarcheId, demarcheIdValidator } from 'camino-common/src/demarche'
import { CaminoDate, caminoDateValidator } from 'camino-common/src/date'
import { titreTypeIdValidator } from 'camino-common/src/static/titresTypes'
import { IGetDemarchesEnSuperpositionPourConsentementDbQuery, IGetEtapeConsentementDbQuery, IUpdateEtapeConsentementDbQuery } from './titres-etapes-consentement.queries.types'
import { sql } from '@pgtyped/runtime'
import { shortCircuitError, ZodUnparseable } from '../../tools/fp-tools'
import { etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes'
import { MultiPolygon, multiPolygonValidator } from 'camino-common/src/perimetre'
import { DeepReadonly, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { SubstanceFiscaleId, substanceFiscaleIdValidator } from 'camino-common/src/static/substancesFiscales'

type GetEtapeConsentement = Omit<GetEtapeConsentementDb, 'geojson4326_perimetre'> & { geojson4326_perimetre: MultiPolygon }
export const getEtapeConsentement = (pool: Pool, etapeId: EtapeId): Effect.Effect<GetEtapeConsentement | null, CaminoError<DBNotFound | DbQueryAccessError | ZodUnparseable>> => {
  return pipe(
    effectDbQueryAndValidate(getEtapeConsentementDb, { etapeId }, pool, getEtapeConsentementDbValidator),
    Effect.filterOrFail(
      result => result.length === 1,
      () => ({ message: dbNotFoundError, extra: { etapeId } })
    ),
    Effect.map(result => result[0]),
    Effect.map(result => {
      if (isNotNullNorUndefined(result.geojson4326_perimetre)) {
        return { ...result, geojson4326_perimetre: result.geojson4326_perimetre }
      }

      return null
    })
  )
}

const getEtapeConsentementDbValidator = z.object({
  id: etapeIdValidator,
  type_id: etapeTypeIdValidator,
  date: caminoDateValidator,
  geojson4326_perimetre: multiPolygonValidator.nullable(),
  substances: z.array(substanceFiscaleIdValidator),
  titre_type_id: titreTypeIdValidator,
  demarche_ids_consentement: z.array(demarcheIdValidator),
})
type GetEtapeConsentementDb = z.infer<typeof getEtapeConsentementDbValidator>

const getEtapeConsentementDb = sql<Redefine<IGetEtapeConsentementDbQuery, { etapeId: EtapeId }, GetEtapeConsentementDb>>`
SELECT
  te.id,
  te.type_id,
  te.date,
  ST_AsGeoJSON(ST_Multi(te.geojson4326_perimetre))::json AS geojson4326_perimetre,
  te.substances AS substances,
  t.type_id AS titre_type_id,
  te.demarche_ids_consentement
FROM titres_etapes te
JOIN titres_demarches td ON te.titre_demarche_id = td.id
JOIN titres t ON td.titre_id = t.id
WHERE
te.id = $etapeId!
`

type UpdateEtapeConsentement = { etapeId: EtapeId; old: DemarcheId[]; new: DemarcheId[] }
export const updateEtapeConsentement = (
  pool: Pool,
  etapeId: EtapeId,
  dateDemande: CaminoDate,
  perimetreDemande: MultiPolygon,
  substancesDemande: SubstanceFiscaleId[],
  oldDemarcheIds: DemarcheId[]
): Effect.Effect<UpdateEtapeConsentement, CaminoError<DbQueryAccessError | ZodUnparseable>> => {
  return pipe(
    effectDbQueryAndValidate(getDemarchesEnSuperpositionPourConsentementDb, { dateDemande, perimetreDemande, substancesDemande }, pool, getDemarchesEnSuperpositionPourConsentementValidator),
    Effect.filterOrFail(
      demarchesEnSuperposition => demarchesEnSuperposition.length > 0,
      () => shortCircuitError('Étape non concernée par le consentement')
    ),
    Effect.flatMap(demarchesEnSuperposition =>
      pipe(
        effectDbQueryAndValidate(updateEtapeConsentementDb, { etapeId, demarcheIds: demarcheIdArrayStringifyValidator.parse(demarchesEnSuperposition.map(({ id }) => id)) }, pool, z.void()),
        Effect.map(() => ({
          etapeId,
          old: oldDemarcheIds,
          new: demarchesEnSuperposition.map(({ id }) => id),
        }))
      )
    ),
    Effect.catchTag('Étape non concernée par le consentement', () =>
      Effect.succeed({
        etapeId,
        old: oldDemarcheIds,
        new: oldDemarcheIds,
      })
    )
  )
}

const getDemarchesEnSuperpositionPourConsentementValidator = z.object({ id: demarcheIdValidator })
type GetDemarchesEnSuperpositionPourConsentement = z.infer<typeof getDemarchesEnSuperpositionPourConsentementValidator>

const getDemarchesEnSuperpositionPourConsentementDb = sql<
  Redefine<
    IGetDemarchesEnSuperpositionPourConsentementDbQuery,
    { dateDemande: CaminoDate; perimetreDemande: DeepReadonly<MultiPolygon>; substancesDemande: DeepReadonly<SubstanceFiscaleId[]> },
    GetDemarchesEnSuperpositionPourConsentement
  >
>`
SELECT
  td.id
FROM titres_demarches td
WHERE
  td.demarche_date_debut <= $dateDemande!
  AND (td.demarche_date_fin IS NULL OR td.demarche_date_fin >= $dateDemande!)
  AND EXISTS(
    WITH fondamentale AS (
      SELECT geojson4326_perimetre, array(SELECT jsonb_array_elements_text(substances)) AS substances FROM titres_etapes te WHERE te.titre_demarche_id = td.id AND te.etape_fondamentale_id = te.id ORDER BY ordre DESC LIMIT 1
    )
    SELECT TRUE FROM fondamentale WHERE ST_INTERSECTS (
       ST_MAKEVALID (fondamentale.geojson4326_perimetre),
       ST_MAKEVALID (ST_GeomFromGeoJSON($perimetreDemande!))
    ) is true
    AND NOT(fondamentale.substances <@ $substancesDemande!::text[])
  )
`

const demarcheIdArrayStringifyValidator = z
  .array(demarcheIdValidator)
  .transform(a => JSON.stringify(a))
  .brand('DemarcheIdArrayStringify')
type DemarcheIdArrayStringify = z.infer<typeof demarcheIdArrayStringifyValidator>

const updateEtapeConsentementDb = sql<
  Redefine<IUpdateEtapeConsentementDbQuery, { etapeId: EtapeId; demarcheIds: DeepReadonly<DemarcheIdArrayStringify> }, void>
>`UPDATE titres_etapes SET demarche_ids_consentement = $demarcheIds! WHERE id = $etapeId!`
