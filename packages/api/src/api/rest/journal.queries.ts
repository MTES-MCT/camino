import { sql } from '@pgtyped/runtime'
import { CaminoDate, caminoDateValidator } from 'camino-common/src/date'
import { QuantiteParMois, quantitesParMoisValidator } from 'camino-common/src/statistiques'
import { TitreId } from 'camino-common/src/validators/titres'
import { CaminoError } from 'camino-common/src/zod-tools'
import { Effect } from 'effect'
import { Pool } from 'pg'
import { z } from 'zod'
import { EffectDbQueryAndValidateErrors, Redefine, effectDbQueryAndValidate } from '../../pg-database'
import { IGetLastJournalInternalQuery, IGetTitresModifiesByMonthDbQuery } from './journal.queries.types'

const lastJournalGetValidator = z.object({ date: caminoDateValidator })
type LastJournalGet = z.infer<typeof lastJournalGetValidator>

export const getDateLastJournal = (pool: Pool, titreId: TitreId): Effect.Effect<CaminoDate | null, CaminoError<EffectDbQueryAndValidateErrors>> =>
  effectDbQueryAndValidate(getLastJournalInternal, { titreId }, pool, lastJournalGetValidator).pipe(Effect.map(result => (result.length === 1 ? result[0].date : null)))

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

export const getTitresModifiesByMonth = (pool: Pool): Effect.Effect<QuantiteParMois[], CaminoError<EffectDbQueryAndValidateErrors>> =>
  effectDbQueryAndValidate(getTitresModifiesByMonthDb, undefined, pool, quantitesParMoisValidator)

const getTitresModifiesByMonthDb = sql<Redefine<IGetTitresModifiesByMonthDbQuery, void, QuantiteParMois>>`
select
    concat(date_part('year', date), '-', to_char(date_part('month', date), 'fm00')) AS mois,
    count(titre_id) as quantite
from
    journaux
where
    utilisateur_id != 'super'
group by
    mois
order by
    mois
`
