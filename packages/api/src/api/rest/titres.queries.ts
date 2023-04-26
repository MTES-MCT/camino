import { sql } from '@pgtyped/runtime'
import { TitreGet } from 'camino-common/src/titres'
import { Redefine } from '../../pg-database'
import { IGetTitreQuery } from './titres.queries.types'

export const getTitre = sql<Redefine<IGetTitreQuery, { id: string }, TitreGet>>`
select
    t.id,
    t.nom,
    t.slug,
    t.titre_statut_id,
    t.type_id,
    coalesce(te.administrations_locales, '[]'::jsonb) as administrations_locales
from
    titres t
    left join titres_etapes te on (te.id = t.props_titre_etapes_ids ->> 'points')
where
    t.id = $ id
LIMIT 1
`
