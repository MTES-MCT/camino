import { sql } from '@pgtyped/runtime'
import { EffectDbQueryAndValidateErrors, Redefine, effectDbQueryAndValidate } from '../../pg-database'
import { IGetTitreUtilisateurDbQuery } from './titres-utilisateurs.queries.types'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { Pool } from 'pg'
import { z } from 'zod'
import { TitreId, titreIdValidator } from 'camino-common/src/validators/titres'
import { UtilisateurId, utilisateurIdValidator } from 'camino-common/src/roles'
import { Effect, pipe } from 'effect'
import { CaminoError } from 'camino-common/src/zod-tools'

export const getTitreUtilisateur = (pool: Pool, titreId: TitreId, userId: UtilisateurId): Effect.Effect<boolean, CaminoError<EffectDbQueryAndValidateErrors>> =>
  pipe(
    effectDbQueryAndValidate(getTitreUtilisateurDb, { titreId, userId }, pool, getTitreUtilisateurDbValidator),
    Effect.map(value => isNotNullNorUndefinedNorEmpty(value))
  )

const getTitreUtilisateurDbValidator = z.object({ utilisateur_id: utilisateurIdValidator, titre_id: titreIdValidator })
const getTitreUtilisateurDb = sql<Redefine<IGetTitreUtilisateurDbQuery, { titreId: TitreId; userId: UtilisateurId }, z.infer<typeof getTitreUtilisateurDbValidator>>>`
select
    utilisateur_id,
    titre_id
from
    utilisateurs__titres
where
    utilisateur_id = $ userId !
    and titre_id = $ titreId !
`
