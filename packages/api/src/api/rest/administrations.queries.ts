/* eslint-disable no-restricted-syntax */
import { Pool } from 'pg'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { sql } from '@pgtyped/runtime'
import { AdministrationId, administrationIdValidator } from 'camino-common/src/static/administrations.js'
import { IGetUtilisateursByAdministrationIdDbQuery } from './administrations.queries.types.js'
import { AdminUserNotNull, adminUserNotNullValidator } from 'camino-common/src/roles.js'
import { z } from 'zod'

export const getUtilisateursByAdministrationId = async (pool: Pool, administrationId: AdministrationId): Promise<AdminUserNotNull[]> => {
  const result = await dbQueryAndValidate(getUtilisateursByAdministrationIdDb, { administrationId }, pool, getUtilisateursByAdministrationIdDbValidator)

  return result.map(a => ({ ...a, administrationId: a.administration_id }))
}

const getUtilisateursByAdministrationIdDbValidator = adminUserNotNullValidator.omit({ administrationId: true }).and(z.object({ administration_id: administrationIdValidator }))

const getUtilisateursByAdministrationIdDb = sql<
  Redefine<IGetUtilisateursByAdministrationIdDbQuery, { administrationId: AdministrationId }, z.infer<typeof getUtilisateursByAdministrationIdDbValidator>>
>`
select
    u.id,
    u.email,
    u.nom,
    u.prenom,
    u.role,
    u.administration_id
from
    utilisateurs u
where
    u.administration_id = $ administrationId !
    and keycloak_id is not null
`
