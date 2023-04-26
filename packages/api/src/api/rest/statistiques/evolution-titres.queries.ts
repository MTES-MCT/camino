import { sql } from '@pgtyped/runtime'
import { CaminoAnnee } from 'camino-common/src/date'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { DepartementId } from 'camino-common/src/static/departement'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId, ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { Redefine } from '../../../pg-database'
import { IGetDepotDbQuery, IGetEtapesTypesDecisionRefusDbQuery, IGetOctroiDbQuery, IGetSurfaceDbQuery } from './evolution-titres.queries.types'

interface GetDepotProps {
  anneeDepart: number
  demarcheTypeIds: DemarcheTypeId[]
  departements: DepartementId[]
  etapeTypeId?: EtapeTypeId
  titreTypeId?: TitreTypeId
}
export const getDepotDb = sql<Redefine<IGetDepotDbQuery, GetDepotProps, { annee: CaminoAnnee; count: string }>>`
select
    substring(et. "date", 0, 5) as annee,
    count(t.*)
from
    titres_etapes et
    join titres_demarches td on td.id = et.titre_demarche_id
    join titres t on t.id = td.titre_id
where
    et.type_id = $ etapeTypeId
    and et.archive is false
    and td.type_id in $$ demarcheTypeIds
    and t.type_id = $ titreTypeId
    and substring(et. "date", 0, 5)::int >= $ anneeDepart
    and exists (
        select
            *
        from
            titres_communes tc
            join communes c on c.id = tc.commune_id
        where
            tc.titre_etape_id = t.props_titre_etapes_ids ->> 'points'
            and c.departement_id::text in $$ departements)
group by
    substring(et. "date", 0, 5)
`

interface GetOctroiProps {
  anneeDepart: number
  demarcheTypeIds: DemarcheTypeId[]
  departements: DepartementId[]
  titreTypeId?: TitreTypeId
}
export const getOctroiDb = sql<Redefine<IGetOctroiDbQuery, GetOctroiProps, { annee: CaminoAnnee; count: string }>>`
select
    substring(td. "demarche_date_debut", 0, 5) as annee,
    count(t.*)
from
    titres_demarches td
    join titres t on t.id = td.titre_id
where
    td.type_id in $$ demarcheTypeIds
    and t.type_id = $ titreTypeId
    and substring(td. "demarche_date_debut", 0, 5)::int >= $ anneeDepart
    and exists (
        select
            *
        from
            titres_communes tc
            join communes c on c.id = tc.commune_id
        where
            tc.titre_etape_id = t.props_titre_etapes_ids ->> 'points'
            and c.departement_id::text in $$ departements)
group by
    substring(td. "demarche_date_debut", 0, 5)
`

interface GetSurfaceProps {
  anneeDepart: number
  demarcheTypeIds: DemarcheTypeId[]
  departements: DepartementId[]
  titreTypeId?: TitreTypeId
}
export const getSurfaceDb = sql<Redefine<IGetSurfaceDbQuery, GetSurfaceProps, { annee: CaminoAnnee; count: string }>>`
select
    substring(td. "demarche_date_debut", 0, 5) as annee,
    sum(t_surface.surface * 100) as count
from
    titres_demarches td
    join titres t on t.id = td.titre_id
    join titres_etapes t_surface on t_surface.id = t.props_titre_etapes_ids ->> 'surface'
where
    td.type_id in $$ demarcheTypeIds
    and t.type_id = $ titreTypeId
    and substring(td. "demarche_date_debut", 0, 5)::int >= $ anneeDepart
    and exists (
        select
            *
        from
            titres_communes tc
            join communes c on c.id = tc.commune_id
        where
            tc.titre_etape_id = t.props_titre_etapes_ids ->> 'points'
            and c.departement_id::text in $$ departements)
group by
    substring(td. "demarche_date_debut", 0, 5)
`

interface GetEtapesTypesDecisionRefusProps {
  anneeDepart: number
  etapesTypesDecisionRefus: EtapeTypeId[]
  etapeStatutRejet: typeof ETAPES_STATUTS.REJETE
  etapeStatutFait: typeof ETAPES_STATUTS.FAIT
  etapeTypeClassementSansSuite: typeof ETAPES_TYPES.classementSansSuite
  demarcheTypeIds: DemarcheTypeId[]
  demarcheStatutIds: DemarcheStatutId[]
  departements: DepartementId[]
  titreTypeId?: TitreTypeId
}
export const getEtapesTypesDecisionRefusDb = sql<Redefine<IGetEtapesTypesDecisionRefusDbQuery, GetEtapesTypesDecisionRefusProps, { annee: CaminoAnnee; count: string }>>`
select
    substring(et. "date", 0, 5) as annee,
    count(distinct t.id)
from
    titres_etapes et
    join titres_demarches td on td.id = et.titre_demarche_id
    join titres t on t.id = td.titre_id
where ((et.type_id in $$ etapesTypesDecisionRefus
        and et.statut_id = $ etapeStatutRejet)
    or (et.type_id = $ etapeTypeClassementSansSuite
        and et.statut_id = $ etapeStatutFait))
and et.archive is false
and td.type_id in $$ demarcheTypeIds
and t.type_id = $ titreTypeId
and td.statut_id in $$ demarcheStatutIds
and substring(et. "date", 0, 5)::int >= $ anneeDepart
and exists (
    select
        *
    from
        titres_communes tc
        join communes c on c.id = tc.commune_id
    where
        tc.titre_etape_id = t.props_titre_etapes_ids ->> 'points'
        and c.departement_id::text in $$ departements)
group by
    substring(et. "date", 0, 5)
`
