import { sql } from '@pgtyped/runtime'
import { effectDbQueryAndValidate, EffectDbQueryAndValidateErrors, Redefine } from '../../pg-database'
import { IGetDemarchesWithMiseEnConcurrenceDbQuery, IUpdateEtapeIdDeMiseEnConcurrenceInternalQuery } from './titres-etapes-mise-en-concurrence.queries.types'
import { EtapeId, etapeIdValidator } from 'camino-common/src/etape'
import { Effect, pipe } from 'effect'
import { z } from 'zod'
import { CaminoError } from 'camino-common/src/zod-tools'
import { Pool } from 'pg'
import { DemarcheId, demarcheIdValidator } from 'camino-common/src/demarche'
import { ETAPE_TYPE_FOR_CONCURRENCY_DATA } from 'camino-common/src/static/etapesTypes'
import { miseEnConcurrenceDureeId } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'

export type MiseEnConcurrenceErrors = EffectDbQueryAndValidateErrors | 'Plusieurs mises en concurrence pour le même périmètre'
export const miseEnConcurrence = (pool: Pool, etapeDemandeId: EtapeId): Effect.Effect<GetDemarchesWithMiseEnConcurrence | null, CaminoError<MiseEnConcurrenceErrors>> => {
  return pipe(
    effectDbQueryAndValidate(
      getDemarchesWithMiseEnConcurrenceDb,
      { etapeDemandeId, demandeTypeId: ETAPE_TYPE_FOR_CONCURRENCY_DATA, sectionDureeId: miseEnConcurrenceDureeId },
      pool,
      getDemarchesWithMiseEnConcurrenceValidator
    ),
    Effect.filterOrFail(
      result => result.length <= 1,
      result => ({ message: 'Plusieurs mises en concurrence pour le même périmètre' as const, extra: { etapeDemandeId, perimetres: result.map(({ id }) => id) } })
    ),
    Effect.map(result => result[0] ?? null)
  )
}

const getDemarchesWithMiseEnConcurrenceValidator = z.object({ id: demarcheIdValidator, mise_en_concurrence_id: etapeIdValidator.nullable() })
type GetDemarchesWithMiseEnConcurrence = z.infer<typeof getDemarchesWithMiseEnConcurrenceValidator>

const getDemarchesWithMiseEnConcurrenceDb = sql<
  Redefine<
    IGetDemarchesWithMiseEnConcurrenceDbQuery,
    { etapeDemandeId: EtapeId; demandeTypeId: typeof ETAPE_TYPE_FOR_CONCURRENCY_DATA; sectionDureeId: typeof miseEnConcurrenceDureeId },
    GetDemarchesWithMiseEnConcurrence
  >
>`
  SELECT
    td.id,
    td_anf.id AS mise_en_concurrence_id
  FROM
    titres_demarches td
    JOIN titres t on t.id = td.titre_id
    JOIN titres_etapes demande on demande.id = $etapeDemandeId
    JOIN titres_demarches myTd on myTd.id = demande.titre_demarche_id
    JOIN titres myT on myT.id = myTd.titre_id
    JOIN titres_etapes td_demande ON td_demande.titre_demarche_id = td.id
    AND td_demande.type_id = $demandeTypeId!
    LEFT JOIN titres_etapes td_anf ON td_anf.titre_demarche_id = td.id
    AND td_anf.type_id = 'anf'
    LEFT JOIN titres_etapes td_css ON td_css.titre_demarche_id = td.id AND td_css.type_id IN ('css', 'des')
  WHERE
    td.archive IS false
    AND td_demande.demarche_id_en_concurrence is null
    AND (td.demarche_date_fin is null OR td.demarche_date_fin >= demande.date)
    AND td.id != myTd.id
    AND t.type_id = myT.type_id
    AND td_demande.date <= demande.date
    AND (td_anf is not null OR td_css.id IS NULL)
    AND EXISTS (
      WITH
        latestFondamentaleEtape as (
          select
            te.geojson4326_perimetre,
            te.substances
          from
            titres_etapes te
          where
            te.date <= demande.date
            AND te.titre_demarche_id = td.id
            AND te.etape_fondamentale_id = te.id
          ORDER BY
            ordre desc
          LIMIT
            1
        )
      select
        true
      from
        latestFondamentaleEtape
      where
        ST_INTERSECTS (
          ST_MAKEVALID (latestFondamentaleEtape.geojson4326_perimetre),
          ST_MAKEVALID (demande.geojson4326_perimetre)
        ) is true
        AND demande.substances ?| array (
          select
            jsonb_array_elements_text(latestFondamentaleEtape.substances)
        )
    )
    AND (
      td_anf is null
      OR (
        date (td_anf.date) + (td_anf.contenu -> $ sectionDureeId ! -> 'duree')::int
      ) >= date (demande.date)
    );
  `

const mauvaisResultatsError = "La mise à jour de l'étape de mise en concurrence a échoué" as const
const updateEtapeIdDeMiseEnConcurrenceValidator = z.object({ demarche_id_en_concurrence: demarcheIdValidator.nullable() })
export type UpdateEtapeIdDeMiseEnConcurrenceErrors = EffectDbQueryAndValidateErrors | typeof mauvaisResultatsError
export const updateEtapeIdDeMiseEnConcurrence = (
  pool: Pool,
  titreEtapeId: EtapeId,
  demarcheIdEnConcurrence: DemarcheId | null
): Effect.Effect<{ old: DemarcheId | null; new: DemarcheId | null }, CaminoError<UpdateEtapeIdDeMiseEnConcurrenceErrors>> => {
  return pipe(
    effectDbQueryAndValidate(updateEtapeIdDeMiseEnConcurrenceInternal, { titreEtapeId, demarcheIdEnConcurrence }, pool, updateEtapeIdDeMiseEnConcurrenceValidator),
    Effect.filterOrFail(
      result => result.length === 1,
      () => ({ message: mauvaisResultatsError })
    ),
    Effect.map(result => ({ old: result[0].demarche_id_en_concurrence, new: demarcheIdEnConcurrence }))
  )
}
const updateEtapeIdDeMiseEnConcurrenceInternal = sql<
  Redefine<IUpdateEtapeIdDeMiseEnConcurrenceInternalQuery, { titreEtapeId: EtapeId; demarcheIdEnConcurrence: DemarcheId | null }, z.infer<typeof updateEtapeIdDeMiseEnConcurrenceValidator>>
>`
UPDATE titres_etapes etape_updated SET demarche_id_en_concurrence = $demarcheIdEnConcurrence!
from titres_etapes etape_original
where etape_original.id = $titreEtapeId!
AND etape_updated.id = etape_original.id
returning etape_original.demarche_id_en_concurrence
`
