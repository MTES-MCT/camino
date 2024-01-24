/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { TitreId } from 'camino-common/src/validators/titres.js'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { IGetLastJournalInternalQuery } from './journal.queries.types.js'
import { CaminoDate, caminoDateValidator } from 'camino-common/src/date.js'
import { z } from 'zod'
import { Pool } from 'pg'

const lastJournalGetValidator = z.object({ date: caminoDateValidator })
type LastJournalGet = z.infer<typeof lastJournalGetValidator>

export const getDateLastJournal = async (pool: Pool, titreId: TitreId): Promise<CaminoDate | null> => {
  const result = await dbQueryAndValidate(getLastJournalInternal, { titreId }, pool, lastJournalGetValidator)

  return result.length > 0 ? result[0].date : null
}

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
