import { sql } from '@pgtyped/runtime'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { DepartementId } from 'camino-common/src/static/departement'
import { ETAPES_STATUTS, EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId, ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { AnneeCountStatistique, anneeCountStatistiqueValidator } from 'camino-common/src/statistiques'
import { Redefine, dbQueryAndValidate } from '../../../pg-database'
import { IGetDepotDbQuery, IGetEtapesTypesDecisionRefusDbQuery, IGetOctroiDbQuery, IGetSurfaceDbQuery } from './evolution-titres.queries.types'
import { Pool } from 'pg'

interface GetDepotProps {
  anneeDepart: number
  demarcheTypeIds: DemarcheTypeId[]
  departements: DepartementId[]
  etapeTypeId?: EtapeTypeId
  titreTypeId?: TitreTypeId
}
export const getDepot = async (pool: Pool, params: GetDepotProps): Promise<AnneeCountStatistique[]> => dbQueryAndValidate(getDepotDb, params, pool, anneeCountStatistiqueValidator)
const getDepotDb = sql<Redefine<IGetDepotDbQuery, GetDepotProps, AnneeCountStatistique>>`
select
    substring(et. "date", 0, 5) as annee,
    count(t.*)
from
    titres_etapes et
    join titres_demarches td on td.id = et.titre_demarche_id
    join titres t on t.id = td.titre_id
    join titres_etapes etapes_communes on t.props_titre_etapes_ids ->> 'points' = etapes_communes.id
where
    et.type_id = $ etapeTypeId
    and et.archive is false
    and td.type_id in $$ demarcheTypeIds
    and t.type_id = $ titreTypeId
    and substring(et. "date", 0, 5)::int >= $ anneeDepart
    and etapes_communes.departements ?| $departements
group by
    substring(et. "date", 0, 5)
`

interface GetOctroiProps {
  anneeDepart: number
  demarcheTypeIds: DemarcheTypeId[]
  departements: DepartementId[]
  titreTypeId?: TitreTypeId
}
export const getOctroi = async (pool: Pool, params: GetOctroiProps): Promise<AnneeCountStatistique[]> => dbQueryAndValidate(getOctroiDb, params, pool, anneeCountStatistiqueValidator)

const getOctroiDb = sql<Redefine<IGetOctroiDbQuery, GetOctroiProps, AnneeCountStatistique>>`
select
    substring(td. "demarche_date_debut", 0, 5) as annee,
    count(t.*)
from
    titres_demarches td
    join titres t on t.id = td.titre_id
    join titres_etapes t_points on t_points.id = t.props_titre_etapes_ids ->> 'points'
where
    td.type_id in $$ demarcheTypeIds
    and t.type_id = $ titreTypeId
    and substring(td. "demarche_date_debut", 0, 5)::int >= $ anneeDepart
    and t_points.departements ?| $ departements
group by
    substring(td. "demarche_date_debut", 0, 5)
`

interface GetSurfaceProps {
  anneeDepart: number
  demarcheTypeIds: DemarcheTypeId[]
  departements: DepartementId[]
  titreTypeId?: TitreTypeId
}
export const getSurface = async (pool: Pool, params: GetSurfaceProps): Promise<AnneeCountStatistique[]> => dbQueryAndValidate(getSurfaceDb, params, pool, anneeCountStatistiqueValidator)
const getSurfaceDb = sql<Redefine<IGetSurfaceDbQuery, GetSurfaceProps, AnneeCountStatistique>>`
select
    substring(td. "demarche_date_debut", 0, 5) as annee,
    sum(t_points.surface * 100) as count
from
    titres_demarches td
    join titres t on t.id = td.titre_id
    join titres_etapes t_points on t_points.id = t.props_titre_etapes_ids ->> 'points'
where
    td.type_id in $$ demarcheTypeIds
    and t.type_id = $ titreTypeId
    and substring(td. "demarche_date_debut", 0, 5)::int >= $ anneeDepart
    and t_points.departements ?| $ departements
group by
    substring(td. "demarche_date_debut", 0, 5)
`

interface GetEtapesTypesDecisionRefusProps {
  anneeDepart: number
  etapesTypesDecisionRefus: EtapeTypeId[]
  etapeStatutRejet: readonly EtapeStatutId[]
  etapeStatutFait: typeof ETAPES_STATUTS.FAIT
  etapeTypeClassementSansSuite: typeof ETAPES_TYPES.classementSansSuite
  demarcheTypeIds: DemarcheTypeId[]
  demarcheStatutIds: DemarcheStatutId[]
  departements: DepartementId[]
  titreTypeId?: TitreTypeId
}

export const getEtapesTypesDecisionRefus = async (pool: Pool, params: GetEtapesTypesDecisionRefusProps): Promise<AnneeCountStatistique[]> =>
  dbQueryAndValidate(getEtapesTypesDecisionRefusDb, params, pool, anneeCountStatistiqueValidator)

const getEtapesTypesDecisionRefusDb = sql<Redefine<IGetEtapesTypesDecisionRefusDbQuery, GetEtapesTypesDecisionRefusProps, AnneeCountStatistique>>`
select
    substring(et. "date", 0, 5) as annee,
    count(distinct t.id)
from
    titres_etapes et
    join titres_demarches td on td.id = et.titre_demarche_id
    join titres t on t.id = td.titre_id
    join titres_etapes etapes_communes on t.props_titre_etapes_ids ->> 'points' = etapes_communes.id
where ((et.type_id in $$ etapesTypesDecisionRefus
        and et.statut_id in $$ etapeStatutRejet)
    or (et.type_id = $ etapeTypeClassementSansSuite
        and et.statut_id = $ etapeStatutFait))
and et.archive is false
and td.type_id in $$ demarcheTypeIds
and t.type_id = $ titreTypeId
and td.statut_id in $$ demarcheStatutIds
and substring(et. "date", 0, 5)::int >= $ anneeDepart
and etapes_communes.departements ?| $ departements
group by
    substring(et. "date", 0, 5)
`
