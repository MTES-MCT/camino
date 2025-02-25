import { sql } from '@pgtyped/runtime'
import { EffectDbQueryAndValidateErrors, Redefine, effectDbQueryAndValidate } from '../../pg-database'
import { IGetAllEtapeIdsDbQuery, IGetEtapesByDemarcheInternalQuery } from './titres-etapes-heritage-contenu-update.queries.types'
import { caminoDateValidator } from 'camino-common/src/date'
import { DemarcheId, demarcheIdValidator } from 'camino-common/src/demarche'
import { DemarcheStatutId, demarcheStatutIdValidator } from 'camino-common/src/static/demarchesStatuts'
import { DemarcheTypeId, demarcheTypeIdValidator } from 'camino-common/src/static/demarchesTypes'
import { etapeStatutIdValidator } from 'camino-common/src/static/etapesStatuts'
import { TitreTypeId, titreTypeIdValidator } from 'camino-common/src/static/titresTypes'
import { ETAPE_TYPE_FOR_CONCURRENCY_DATA, etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes'
import { TitreId, titreIdValidator } from 'camino-common/src/validators/titres'
import { etapeBrouillonValidator, EtapeId, etapeIdValidator } from 'camino-common/src/etape'
import { z } from 'zod'
import { Pool } from 'pg'
import { communeValidator } from 'camino-common/src/static/communes'
import { TitreEtapeForMachine } from '../rules-demarches/machine-common'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { km2Validator } from 'camino-common/src/number'
import { CaminoError } from 'camino-common/src/zod-tools'
import { Effect } from 'effect'

const getAllEtapeIdValidator = z.object({ id: etapeIdValidator, heritage_contenu: z.record(z.record(z.object({ etapeId: etapeIdValidator.optional().nullable() }))).nullable() })

type GetAllEtapes = z.infer<typeof getAllEtapeIdValidator>

export const getAllEtapeIds = (pool: Pool): Effect.Effect<{ ids: Set<EtapeId>; etapes: GetAllEtapes[] }, CaminoError<EffectDbQueryAndValidateErrors>> =>
  effectDbQueryAndValidate(getAllEtapeIdsDb, {}, pool, getAllEtapeIdValidator).pipe(
    Effect.map(etapes => {
      return { ids: new Set(etapes.map(({ id }) => id)), etapes }
    })
  )

const getAllEtapeIdsDb = sql<Redefine<IGetAllEtapeIdsDbQuery, {}, z.infer<typeof getAllEtapeIdValidator>>>`select id, heritage_contenu from titres_etapes where archive is false`

const getEtapesByDemarcheValidator = z.object({
  contenu: z.any().nullable(),
  date: caminoDateValidator.nullable(),
  demarche_id: demarcheIdValidator,
  demarche_statut_id: demarcheStatutIdValidator,
  demarche_type_id: demarcheTypeIdValidator,
  heritage_contenu: z.any().nullable(),
  demarche_id_en_concurrence: demarcheIdValidator.nullable(),
  demarche_concurrente_public_lecture: z.boolean().nullable(),
  id: etapeIdValidator.nullable(),
  ordre: z.number().nullable(),
  statut_id: etapeStatutIdValidator.nullable(),
  titre_id: titreIdValidator,
  titre_type_id: titreTypeIdValidator,
  communes: z.array(communeValidator.pick({ id: true })).nullable(),
  surface: km2Validator.nullable(),
  type_id: etapeTypeIdValidator.nullable(),
  is_brouillon: etapeBrouillonValidator.nullable(),
  has_titre_from: z.boolean(),
  demarche_ids_consentement: z.array(demarcheIdValidator).nullable(),
})

export const getDemarches = (
  pool: Pool,
  demarcheId?: DemarcheId,
  titreId?: TitreId
): Effect.Effect<
  {
    [key: DemarcheId]: {
      etapes: TitreEtapeForMachine[]
      id: DemarcheId
      typeId: DemarcheTypeId
      titreTypeId: TitreTypeId
      titreId: TitreId
      statutId: DemarcheStatutId
    }
  },
  CaminoError<EffectDbQueryAndValidateErrors>
> =>
  effectDbQueryAndValidate(getEtapesByDemarcheInternal, { demarcheId, titreId }, pool, getEtapesByDemarcheValidator).pipe(
    Effect.map(etapes => {
      // FIXMACHINE trier les démarches par ordre de la première étape pour avoir la bonne visibilité des démarches
      return etapes.reduce<{
        [key: DemarcheId]: {
          etapes: TitreEtapeForMachine[]
          id: DemarcheId
          typeId: DemarcheTypeId
          titreTypeId: TitreTypeId
          titreId: TitreId
          statutId: DemarcheStatutId
        }
      }>((acc, row) => {
        if (!isNotNullNorUndefined(acc[row.demarche_id])) {
          acc[row.demarche_id] = {
            etapes: [],
            id: row.demarche_id,
            titreId: row.titre_id,
            titreTypeId: row.titre_type_id,
            typeId: row.demarche_type_id,
            statutId: row.demarche_statut_id,
          }
        }

        if (
          isNotNullNorUndefined(row.id) &&
          isNotNullNorUndefined(row.ordre) &&
          isNotNullNorUndefined(row.type_id) &&
          isNotNullNorUndefined(row.statut_id) &&
          isNotNullNorUndefined(row.date) &&
          isNotNullNorUndefined(row.is_brouillon)
        ) {
          acc[row.demarche_id].etapes.push({
            id: row.id,
            ordre: row.ordre,
            typeId: row.type_id,
            statutId: row.statut_id,
            isBrouillon: row.is_brouillon,
            date: row.date,
            contenu: row.contenu,
            heritageContenu: row.heritage_contenu,
            communes: row.communes,
            surface: row.surface,
            concurrence:
              row.type_id === ETAPE_TYPE_FOR_CONCURRENCY_DATA
                ? isNotNullNorUndefined(row.demarche_id_en_concurrence) && isNotNullNorUndefined(row.demarche_concurrente_public_lecture)
                  ? { amIFirst: false, demarcheConcurrenteVisibilite: row.demarche_concurrente_public_lecture === true ? 'publique' : 'confidentielle' }
                  : { amIFirst: true }
                : 'non-applicable',
            demarcheIdsConsentement: row.demarche_ids_consentement ?? [],
            hasTitreFrom: row.has_titre_from,
          })
        }

        return acc
      }, {})
    })
  )

const getEtapesByDemarcheInternal = sql<Redefine<IGetEtapesByDemarcheInternalQuery, { demarcheId?: DemarcheId; titreId?: TitreId }, z.infer<typeof getEtapesByDemarcheValidator>>>`
SELECT
    titre.id as titre_id,
    titre.type_id as titre_type_id,
    etape.id,
    etape.ordre,
    etape.type_id,
    etape.statut_id,
    etape.date,
    etape.contenu,
    etape.surface,
    etape.is_brouillon,
    etape.heritage_contenu,
    etape.demarche_id_en_concurrence,
    etape.demarche_ids_consentement as demarche_ids_consentement,
    demarche.id as demarche_id,
    demarche.type_id as demarche_type_id,
    demarche.statut_id as demarche_statut_id,
    etape.communes AS communes,
    demarche_concurrente.public_lecture as demarche_concurrente_public_lecture,
    EXISTS(select 1 from titres__titres tt where titre.id = tt.titre_to_id) as has_titre_from
from
    titres_demarches demarche
    left join titres_etapes etape on (etape.titre_demarche_id = demarche.id
            and etape.archive is false)
    join titres titre on demarche.titre_id = titre.id
    left join titres_demarches demarche_concurrente on demarche_concurrente.id = etape.demarche_id_en_concurrence
where
    demarche.archive = false
    and titre.archive = false
    and ($ demarcheId::text IS NULL
        or demarche.id = $ demarcheId)
    and ($ titreId::text IS NULL
        or titre.id = $ titreId)
order by
    demarche.id,
    etape.ordre
`
