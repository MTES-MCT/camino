/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { IGetTitreUtilisateurDbQuery } from './titres-utilisateurs.queries.types.js'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools.js'
import { Pool } from 'pg'
import { z } from 'zod'
import { TitreId, titreIdValidator } from 'camino-common/src/validators/titres.js'
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
    and titre_id = $ titreId ! perl: warning: Setting locale failed. perl: warning: Please check that your locale settings: LC_ALL = "C.UTF-8",
    LANG = (unset) are supported
    and installed on your system. perl: warning: Falling back to the standard locale ("C").perl: warning: Setting locale failed. perl: warning: Please check that your locale settings: LC_ALL = "C.UTF-8",
    LANG = (unset) are supported
    and installed on your system. perl: warning: Falling back to the standard locale ("C").perl: warning: Setting locale failed. perl: warning: Please check that your locale settings: LC_ALL = "C.UTF-8",
    LANG = (unset) are supported
    and installed on your system. perl: warning: Falling back to the standard locale ("C").perl: warning: Setting locale failed. perl: warning: Please check that your locale settings: LC_ALL = "C.UTF-8",
    LANG = (unset) are supported
    and installed on your system. perl: warning: Falling back to the standard locale ("C").perl: warning: Setting locale failed. perl: warning: Please check that your locale settings: LC_ALL = "C.UTF-8",
    LANG = (unset) are supported
    and installed on your system. perl: warning: Falling back to the standard locale ("C").perl: warning: Setting locale failed. perl: warning: Please check that your locale settings: LC_ALL = "C.UTF-8",
    LANG = (unset) are supported
    and installed on your system. perl: warning: Falling back to the standard locale ("C").perl: warning: Setting locale failed. perl: warning: Please check that your locale settings: LC_ALL = "C.UTF-8",
    LANG = (unset) are supported
    and installed on your system. perl: warning: Falling back to the standard locale ("C").perl: warning: Setting locale failed. perl: warning: Please check that your locale settings: LC_ALL = "C.UTF-8",
    LANG = (unset) are supported
    and installed on your system. perl: warning: Falling back to the standard locale ("C").perl: warning: Setting locale failed. perl: warning: Please check that your locale settings: LC_ALL = "C.UTF-8",
    LANG = (unset) are supported
    and installed on your system. perl: warning: Falling back to the standard locale ("C").
perl: warning: Setting locale failed.
perl: warning: Please check that your locale settings:
	LC_ALL = "C.UTF-8",
	LANG = (unset)
    are supported and installed on your system.
perl: warning: Falling back to the standard locale ("C").
`
