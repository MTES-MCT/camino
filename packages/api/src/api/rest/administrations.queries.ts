import { Pool } from 'pg'
import { DbQueryAccessError, Redefine, dbQueryAndValidate, effectDbQueryAndValidate } from '../../pg-database'
import { sql } from '@pgtyped/runtime'
import { AdministrationId, administrationIdValidator } from 'camino-common/src/static/administrations'
import { AdministrationActiviteTypeEmail, administrationActiviteTypeEmailValidator } from 'camino-common/src/administrations'
import {
  IDeleteAdministrationActiviteTypeEmailDbQuery,
  IGetActiviteTypeEmailsByAdministrationIdDbQuery,
  IGetActiviteTypeEmailsByAdministrationIdsDbQuery,
  IGetUtilisateursByAdministrationIdDbQuery,
  IInsertAdministrationActiviteTypeEmailDbQuery,
} from './administrations.queries.types'
import { AdminUserNotNull, adminUserNotNullValidator } from 'camino-common/src/roles'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { NonEmptyArray } from 'camino-common/src/typescript-tools'
import { z } from 'zod'
import { CaminoError } from 'camino-common/src/zod-tools'
import { ZodUnparseable } from '../../tools/fp-tools'
import { Effect, pipe } from 'effect'

export const getUtilisateursByAdministrationId = async (pool: Pool, administrationId: AdministrationId): Promise<AdminUserNotNull[]> => {
  const result = await dbQueryAndValidate(getUtilisateursByAdministrationIdDb, { administrationId }, pool, getUtilisateursByAdministrationIdDbValidator)

  return result.map(a => ({ ...a, administrationId }))
}

const getUtilisateursByAdministrationIdDbValidator = adminUserNotNullValidator.omit({ administrationId: true })

const getUtilisateursByAdministrationIdDb = sql<
  Redefine<IGetUtilisateursByAdministrationIdDbQuery, { administrationId: AdministrationId }, z.infer<typeof getUtilisateursByAdministrationIdDbValidator>>
>`
select
    u.id,
    u.email,
    u.nom,
    u.prenom,
    u.role,
    u.telephone_mobile,
    u.telephone_fixe
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

export const deleteAdministrationActiviteTypeEmail = (
  pool: Pool,
  administrationId: AdministrationId,
  administrationActiviteTypeEmail: AdministrationActiviteTypeEmail
): Effect.Effect<boolean, CaminoError<ZodUnparseable | DbQueryAccessError>> => {
  return pipe(
    effectDbQueryAndValidate(deleteAdministrationActiviteTypeEmailDb, { administrationId, ...administrationActiviteTypeEmail }, pool, z.void()),
    Effect.map(() => true)
  )
}

const deleteAdministrationActiviteTypeEmailDb = sql<
  Redefine<IDeleteAdministrationActiviteTypeEmailDbQuery, { administrationId: AdministrationId; activite_type_id: ActivitesTypesId; email: string }, void>
>`
delete from administrations__activites_types__emails
where administration_id = $ administrationId !
    and activite_type_id = $ activite_type_id !
    and email = $ email !
`

export const insertAdministrationActiviteTypeEmail = (
  pool: Pool,
  administrationId: AdministrationId,
  administrationActiviteTypeEmail: AdministrationActiviteTypeEmail
): Effect.Effect<boolean, CaminoError<ZodUnparseable | DbQueryAccessError>> => {
  return pipe(
    effectDbQueryAndValidate(insertAdministrationActiviteTypeEmailDb, { administrationId, ...administrationActiviteTypeEmail }, pool, z.void()),
    Effect.map(() => true)
  )
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
    administration_id in $$ administrationIds !
`
