/* eslint-disable no-restricted-syntax */
import { Pool } from 'pg'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { sql } from '@pgtyped/runtime'
import { AdministrationId, administrationIdValidator } from 'camino-common/src/static/administrations.js'
import { AdministrationActiviteTypeEmail, administrationActiviteTypeEmailValidator } from 'camino-common/src/administrations.js'
import {
  IDeleteAdministrationActiviteTypeEmailDbQuery,
  IGetActiviteTypeEmailsByAdministrationIdDbQuery,
  IGetActiviteTypeEmailsByAdministrationIdsDbQuery,
  IGetUtilisateursByAdministrationIdDbQuery,
  IInsertAdministrationActiviteTypeEmailDbQuery,
} from './administrations.queries.types.js'
import { AdminUserNotNull, adminUserNotNullValidator } from 'camino-common/src/roles.js'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes.js'
import { NonEmptyArray } from 'camino-common/src/typescript-tools.js'
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

export const getActiviteTypeEmailsByAdministrationId = async (pool: Pool, administrationId: AdministrationId): Promise<AdministrationActiviteTypeEmail[]> => {
  return dbQueryAndValidate(getActiviteTypeEmailsByAdministrationIdDb, { administrationId }, pool, administrationActiviteTypeEmailValidator)
}

const getActiviteTypeEmailsByAdministrationIdDb = sql<Redefine<IGetActiviteTypeEmailsByAdministrationIdDbQuery, { administrationId: AdministrationId }, AdministrationActiviteTypeEmail>>`
select
    activite_type_id,
    email
from
    administrations__activites_types__emails
where
    administration_id = $ administrationId !
`

export const deleteAdministrationActiviteTypeEmail = async (pool: Pool, administrationId: AdministrationId, administrationActiviteTypeEmail: AdministrationActiviteTypeEmail): Promise<void> => {
  await dbQueryAndValidate(deleteAdministrationActiviteTypeEmailDb, { administrationId, ...administrationActiviteTypeEmail }, pool, z.void())
}

const deleteAdministrationActiviteTypeEmailDb = sql<
  Redefine<IDeleteAdministrationActiviteTypeEmailDbQuery, { administrationId: AdministrationId; activite_type_id: ActivitesTypesId; email: string }, void>
>`
delete from administrations__activites_types__emails
where administration_id = $ administrationId !
    and activite_type_id = $ activite_type_id !
    and email = $ email !
`

export const insertAdministrationActiviteTypeEmail = async (pool: Pool, administrationId: AdministrationId, administrationActiviteTypeEmail: AdministrationActiviteTypeEmail): Promise<void> => {
  await dbQueryAndValidate(insertAdministrationActiviteTypeEmailDb, { administrationId, ...administrationActiviteTypeEmail }, pool, z.void())
}

const insertAdministrationActiviteTypeEmailDb = sql<
  Redefine<IInsertAdministrationActiviteTypeEmailDbQuery, { administrationId: AdministrationId; activite_type_id: ActivitesTypesId; email: string }, void>
>`
insert into administrations__activites_types__emails (activite_type_id, administration_id, email)
    VALUES ($ activite_type_id !, $ administrationId !, $ email !)
`

const getActiviteTypeEmailsByAdministrationIdsValidator = administrationActiviteTypeEmailValidator.extend({ administration_id: administrationIdValidator })

export type GetActiviteTypeEmailsByAdministrationIds = z.infer<typeof getActiviteTypeEmailsByAdministrationIdsValidator>
export const getActiviteTypeEmailsByAdministrationIds = async (pool: Pool, administrationIds: NonEmptyArray<AdministrationId>): Promise<GetActiviteTypeEmailsByAdministrationIds[]> => {
  return dbQueryAndValidate(getActiviteTypeEmailsByAdministrationIdsDb, { administrationIds }, pool, getActiviteTypeEmailsByAdministrationIdsValidator)
}

const getActiviteTypeEmailsByAdministrationIdsDb = sql<
  Redefine<IGetActiviteTypeEmailsByAdministrationIdsDbQuery, { administrationIds: NonEmptyArray<AdministrationId> }, GetActiviteTypeEmailsByAdministrationIds>
>`
select
    activite_type_id,
    email,
    administration_id
from
    administrations__activites_types__emails
where
    administration_id in ($ administrationIds !)
`
