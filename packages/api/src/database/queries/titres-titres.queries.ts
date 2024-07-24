import { TitreId } from 'camino-common/src/validators/titres.js'
import { IDeleteTitreTitreInternalQuery, IInsertTitreTitreInternalQuery } from './titres-titres.queries.types.js'
import { DbQueryAccessError, Redefine, effectDbQueryAndValidate } from '../../pg-database.js'
import { sql } from '@pgtyped/runtime'
import { Effect, pipe } from 'effect'
import { CaminoError } from 'camino-common/src/zod-tools.js'
import { Pool } from 'pg'
import { z } from 'zod'
import { ZodUnparseable } from '../../tools/fp-tools.js'

interface LinkTitre {
  linkTo: TitreId
  linkFrom: TitreId[]
}
type LinkTitresErrors = DbQueryAccessError | ZodUnparseable
export const linkTitres = (pool: Pool, link: LinkTitre): Effect.Effect<void, CaminoError<LinkTitresErrors>> => {
  return pipe(
    effectDbQueryAndValidate(deleteTitreTitreInternal, { linkTo: link.linkTo }, pool, z.void()),
    Effect.flatMap(() => {
      return Effect.forEach(link.linkFrom, titreIdToLink => {
        return effectDbQueryAndValidate(insertTitreTitreInternal, { linkTo: link.linkTo, titreFromId: titreIdToLink }, pool, z.void())
      })
    }),
    Effect.map(() => true)
  )
}
const deleteTitreTitreInternal = sql<Redefine<IDeleteTitreTitreInternalQuery, { linkTo: TitreId }, void>>`
DELETE FROM titres__titres where titre_to_id = $linkTo!
`

const insertTitreTitreInternal = sql<Redefine<IInsertTitreTitreInternalQuery, { linkTo: TitreId; titreFromId: TitreId }, void>>`
INSERT INTO titres__titres (titre_to_id, titre_from_id) VALUES ($linkTo!, $titreFromId!)
`
