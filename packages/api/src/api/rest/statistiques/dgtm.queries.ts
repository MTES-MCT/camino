import { sql } from '@pgtyped/runtime'
import { SUBSTANCES_FISCALES_IDS, SubstanceFiscaleId } from 'camino-common/src/static/substancesFiscales'
import { Redefine, dbQueryAndValidate } from '../../../pg-database'
import { IGetProductionOrDbQuery } from './dgtm.queries.types'
import { AnneeCountStatistique, anneeCountStatistiqueValidator } from 'camino-common/src/statistiques'
import { Pool } from 'pg'

export const getProductionOr = async (pool: Pool) => dbQueryAndValidate(getProductionOrDb, { substance: SUBSTANCES_FISCALES_IDS.or }, pool, anneeCountStatistiqueValidator)
// On peut récupérer le nombre de producteurs d’or que à partir de l’année 2018. L’année à laquelle nous avons commencé à récolter les productions dans Camino
const getProductionOrDb = sql<Redefine<IGetProductionOrDbQuery, { substance: SubstanceFiscaleId }, AnneeCountStatistique>>`
select
    result.annee,
    count(result.titulaire)
from ( select distinct
        ta.annee,
        jsonb_array_elements(etape_titulaires.titulaire_ids) as titulaire
    from
        titres_activites ta
    left join titres t on ta.titre_id = t.id
    left join titres_etapes etape_titulaires on etape_titulaires.id = t.props_titre_etapes_ids ->> 'titulaires'
where
    ta.type_id in ('gra', 'grx')
    and (ta.contenu -> 'substancesFiscales' -> $ substance)::int > 0
    and ta.activite_statut_id = 'dep'
    and ta.annee > 2017) result
where
    result.annee is not null
group by
    result.annee
`
