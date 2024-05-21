/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../../pg-database.js'
import { Pool } from 'pg'
import { z } from 'zod'
import { roleValidator } from 'camino-common/src/roles.js'
import { administrationIdValidator } from 'camino-common/src/static/administrations.js'
import { IGetUtilisateursStatsDbQuery } from './datagouv.queries.types.js'

export const getUtilisateursStats = async (pool: Pool) => dbQueryAndValidate(getUtilisateursStatsDb, undefined, pool, getUtilisateursStatsValidator)

const getUtilisateursStatsValidator = z.object({ role: roleValidator, administration_id: administrationIdValidator.nullable() })
type GetUtilisateursStats = z.infer<typeof getUtilisateursStatsValidator>
const getUtilisateursStatsDb = sql<Redefine<IGetUtilisateursStatsDbQuery, void, GetUtilisateursStats>>`
select
    u.role,
    u.administration_id
from
    utilisateurs u
where
    u.email is not null
    and u.role != 'super' perl: warning: Setting locale failed. perl: warning: Please check that your locale settings: LC_ALL = "C.UTF-8",
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
