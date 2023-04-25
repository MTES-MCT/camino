import { sql } from '@pgtyped/runtime'
import { SubstanceFiscaleId } from 'camino-common/src/static/substancesFiscales'
import { Redefine } from '../../../pg-database.js'
import { IGetProductionOrDbQuery } from './dgtm.queries.types.js'
import { z } from 'zod'
import { caminoAnneeValidator } from 'camino-common/src/date.js'

export const getProductionOrValidator = z.object({
  annee: caminoAnneeValidator,
  count: z.coerce.number(),
})
export type ProductionOr = z.infer<typeof getProductionOrValidator>

// On peut récupérer le nombre de producteurs d’or que à partir de l’année 2018. L’année à laquelle nous avons commencé à récolter les productions dans Camino
export const getProductionOrDb = sql<Redefine<IGetProductionOrDbQuery, { substance: SubstanceFiscaleId }, ProductionOr>>`
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
