import { sql } from '@pgtyped/runtime'
import { TitreGet } from 'camino-common/src/titres'
import { Redefine } from '../../pg-database.js'
import { IGetLastJournalQuery, IGetTitreQuery } from './titres.queries.types.js'
import { caminoDateValidator } from 'camino-common/src/date.js'
import { z } from 'zod'

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

export const lastJournalGetValidator = z.object({ date: caminoDateValidator })
type LastJournalGet = z.infer<typeof lastJournalGetValidator>

export const getLastJournal = sql<Redefine<IGetLastJournalQuery, { titreId: string }, LastJournalGet>>`
select
    to_date(date::text, 'yyyy-mm-dd')::text as date
from
    journaux
where
    titre_id = $ titreId
order by
    date desc
LIMIT 1
`
