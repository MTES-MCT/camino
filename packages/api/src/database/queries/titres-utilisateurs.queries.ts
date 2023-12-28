/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { IGetTitreUtilisateurDbQuery } from './titres-utilisateurs.queries.types.js'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools.js'
import { Pool } from 'pg'
import { z } from 'zod'
import { TitreId, titreIdValidator } from 'camino-common/src/titres.js'
import { UtilisateurId, utilisateurIdValidator } from 'camino-common/src/roles.js'

export const getTitreUtilisateur = async (pool: Pool, titreId: TitreId, userId: UtilisateurId): Promise<boolean> => {
  return isNotNullNorUndefinedNorEmpty(await dbQueryAndValidate(getTitreUtilisateurDb, { titreId, userId }, pool, getTitreUtilisateurDbValidator))
}

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
