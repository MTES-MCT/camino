import { sql } from '@pgtyped/runtime'
import { SubstanceFiscaleId } from 'camino-common/src/static/substancesFiscales'
import { IGetProductionOrQuery } from './dgtm.queries.types'

type Redefine<T, V> = T extends { params: infer A } ? (keyof A extends keyof V ? Omit<T, 'params'> & { params: V } : false) : false

// On peut récupérer le nombre de producteurs d’or que à partir de l’année 2018. L’année à laquelle nous avons commencé à récolter les productions dans Camino
export const getProductionOr = sql<Redefine<IGetProductionOrQuery, { substance: SubstanceFiscaleId }>>`
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
