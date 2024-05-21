/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { IGetEntrepriseEtablissementsDbQuery } from './entreprises-etablissements.queries.types.js'
import { EntrepriseId, entrepriseEtablissementValidator } from 'camino-common/src/entreprise.js'
import { Pool } from 'pg'
import { z } from 'zod'

type GetEntrepriseEtablissement = z.infer<typeof entrepriseEtablissementValidator>

export const getEntrepriseEtablissements = async (pool: Pool, entreprise_id: EntrepriseId): Promise<GetEntrepriseEtablissement[] | null> => {
  return dbQueryAndValidate(getEntrepriseEtablissementsDb, { entreprise_id }, pool, entrepriseEtablissementValidator)
}

const getEntrepriseEtablissementsDb = sql<Redefine<IGetEntrepriseEtablissementsDbQuery, { entreprise_id: EntrepriseId }, GetEntrepriseEtablissement>>`
select
    id,
    date_debut,
    date_fin,
    nom
from
    entreprises_etablissements
where
    entreprise_id = $ entreprise_id ! perl: warning: Setting locale failed. perl: warning: Please check that your locale settings: LC_ALL = "C.UTF-8", LANG = (unset) are supported
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
