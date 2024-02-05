/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { IGetEtapesByDemarcheInternalQuery } from './titres-etapes-heritage-contenu-update.queries.types'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { caminoDateValidator } from 'camino-common/src/date.js'
import { DemarcheId, demarcheIdValidator } from 'camino-common/src/demarche.js'
import { DemarcheStatutId, demarcheStatutIdValidator } from 'camino-common/src/static/demarchesStatuts.js'
import { DemarcheTypeId, demarcheTypeIdValidator } from 'camino-common/src/static/demarchesTypes.js'
import { etapeStatutIdValidator } from 'camino-common/src/static/etapesStatuts.js'
import { TitreTypeId, titreTypeIdValidator } from 'camino-common/src/static/titresTypes.js'
import { etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes.js'
import { TitreId, titreIdValidator } from 'camino-common/src/validators/titres.js'
import { etapeIdValidator } from 'camino-common/src/etape.js'
import { z } from 'zod'
import { Pool } from 'pg'
import { communeValidator } from 'camino-common/src/static/communes.js'
import { TitreEtapeForMachine } from '../rules-demarches/machine-common.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'

const getEtapesByDemarcheValidator = z.object({
  contenu: z.any().nullable(),
  date: caminoDateValidator.nullable(),
  demarche_id: demarcheIdValidator,
  demarche_statut_id: demarcheStatutIdValidator,
  demarche_type_id: demarcheTypeIdValidator,
  heritage_contenu: z.any().nullable(),
  id: etapeIdValidator.nullable(),
  ordre: z.number().nullable(),
  statut_id: etapeStatutIdValidator.nullable(),
  titre_id: titreIdValidator,
  titre_type_id: titreTypeIdValidator,
  communes: z.array(communeValidator.pick({ id: true })).nullable(),
  surface: z.number().nullable(),
  type_id: etapeTypeIdValidator.nullable(),
})

export const getDemarches = async (
  pool: Pool,
  demarcheId?: DemarcheId,
  titreId?: TitreId
): Promise<{
  [key: DemarcheId]: {
    etapes: TitreEtapeForMachine[]
    id: DemarcheId
    typeId: DemarcheTypeId
    titreTypeId: TitreTypeId
    titreId: TitreId
    statutId: DemarcheStatutId
  }
}> => {
  const etapes = await dbQueryAndValidate(getEtapesByDemarcheInternal, { demarcheId, titreId }, pool, getEtapesByDemarcheValidator)

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
    if (!acc[row.demarche_id]) {
      acc[row.demarche_id] = {
        etapes: [],
        id: row.demarche_id,
        titreId: row.titre_id,
        titreTypeId: row.titre_type_id,
        typeId: row.demarche_type_id,
        statutId: row.demarche_statut_id,
      }
    }

    if (isNotNullNorUndefined(row.id) && isNotNullNorUndefined(row.ordre) && isNotNullNorUndefined(row.type_id) && isNotNullNorUndefined(row.statut_id) && isNotNullNorUndefined(row.date)) {
      acc[row.demarche_id].etapes.push({
        id: row.id,
        ordre: row.ordre,
        typeId: row.type_id,
        statutId: row.statut_id,
        date: row.date,
        contenu: row.contenu,
        heritageContenu: row.heritage_contenu,
        communes: row.communes,
        surface: row.surface,
      })
    }

    return acc
  }, {})
}

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
    etape.heritage_contenu,
    demarche.id as demarche_id,
    demarche.type_id as demarche_type_id,
    demarche.statut_id as demarche_statut_id,
    etape.communes as communes
from
    titres_demarches demarche
    left join titres_etapes etape on (etape.titre_demarche_id = demarche.id
            and etape.archive is false)
    join titres titre on demarche.titre_id = titre.id
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
