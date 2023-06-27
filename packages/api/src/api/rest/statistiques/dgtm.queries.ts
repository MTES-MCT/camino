/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { SUBSTANCES_FISCALES_IDS, SubstanceFiscaleId } from 'camino-common/src/static/substancesFiscales.js'
import { Redefine, dbQueryAndValidate } from '../../../pg-database.js'
import { IGetProductionOrDbQuery } from './dgtm.queries.types.js'
import { AnneeCountStatistique, anneeCountStatistiqueValidator } from 'camino-common/src/statistiques.js'
import { Pool } from 'pg'

export const getProductionOr = async (pool: Pool) => dbQueryAndValidate(getProductionOrDb, { substance: SUBSTANCES_FISCALES_IDS.or }, pool, anneeCountStatistiqueValidator)
// On peut récupérer le nombre de producteurs d’or que à partir de l’année 2018. L’année à laquelle nous avons commencé à récolter les productions dans Camino
const getProductionOrDb = sql<Redefine<IGetProductionOrDbQuery, { substance: SubstanceFiscaleId }, AnneeCountStatistique>>`
select distinct
    ta.annee,
    count(distinct tt.entreprise_id)
from
    titres_activites ta
    left join titres t on ta.titre_id = t.id
    left join titres_titulaires tt on tt.titre_etape_id = t.props_titre_etapes_ids ->> 'titulaires'
where
    ta.type_id in ('gra', 'grx')
    and (ta.contenu -> 'substancesFiscales' -> $ substance)::int > 0
    and ta.annee > 2017
group by
    ta.annee
`
