/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { TitreGet, TitreId, titreGetValidator } from 'camino-common/src/titres.js'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { IGetLastJournalInternalQuery, IGetTitreCommunesInternalQuery, IGetTitreInternalQuery } from './titres.queries.types.js'
import { caminoDateValidator } from 'camino-common/src/date.js'
import { z } from 'zod'
import { Commune, communeValidator } from 'camino-common/src/static/communes.js'
import { Pool } from 'pg'

export const getTitre = async (pool: Pool, params: { id: TitreId }) => dbQueryAndValidate(getTitreInternal, params, pool, titreGetValidator)

const getTitreInternal = sql<Redefine<IGetTitreInternalQuery, { id: TitreId }, TitreGet>>`
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

export const getLastJournal = async (pool: Pool, params: { titreId: TitreId }) => dbQueryAndValidate(getLastJournalInternal, params, pool, lastJournalGetValidator)

const getLastJournalInternal = sql<Redefine<IGetLastJournalInternalQuery, { titreId: TitreId }, LastJournalGet>>`
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

export const getTitreCommunes = async (pool: Pool, params: { id: TitreId }) => dbQueryAndValidate(getTitreCommunesInternal, params, pool, communeValidator)

const getTitreCommunesInternal = sql<Redefine<IGetTitreCommunesInternalQuery, { id: TitreId }, Commune>>`
select
    c.id,
    c.nom
from
    titres t
    join titres_etapes te on te.id = t.props_titre_etapes_ids ->> 'points'
    join jsonb_array_elements(te.communes) as etapes_communes on true
    join communes c on c.id = etapes_communes ->> 'id'
where
    t.id = $ id
`
