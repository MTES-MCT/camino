import { sql } from '@pgtyped/runtime'
import { Effect, pipe } from 'effect'
import { DbQueryAccessError, Redefine, dbQueryAndValidate, effectDbQueryAndValidate } from '../../pg-database'
import {
  AdminUserNotNull,
  EntrepriseUserNotNull,
  User,
  UserNotNull,
  UtilisateurId,
  isEntrepriseOrBureauDEtude,
  isEntrepriseOrBureauDetudeRole,
  roleValidator,
  userNotNullValidator,
  utilisateurIdValidator,
} from 'camino-common/src/roles'
import { z } from 'zod'
import { CaminoError } from 'camino-common/src/zod-tools'
import { Pool } from 'pg'
import { administrationIdValidator } from 'camino-common/src/static/administrations'
import { canReadUtilisateur, canReadUtilisateurs } from 'camino-common/src/permissions/utilisateurs'
import { UtilisateursSearchParamsInput, UtilisateursSearchParams } from 'camino-common/src/utilisateur'
import {
  ICreateUtilisateurDbQuery,
  ICreateUtilisateurEntrepriseDbQuery,
  IDeleteUtilisateurEntrepriseDbQuery,
  IGetKeycloakIdByUserIdDbQuery,
  IGetUtilisateurByEmailDbQuery,
  IGetUtilisateurByIdDbQuery,
  IGetUtilisateurByKeycloakIdDbQuery,
  IGetUtilisateurByTitreIdDbQuery,
  IGetUtilisateursDbQuery,
  IGetUtilisateursEmailsByEntrepriseIdsDbQuery,
  ISoftDeleteUtilisateurDbQuery,
  IUpdateUtilisateurDbQuery,
  IUpdateUtilisateurRoleDbQuery,
} from './utilisateurs.queries.types'
import { ZodUnparseable, callAndExit, zodParseEffect } from '../../tools/fp-tools'
import { DeepReadonly, NonEmptyArray, Nullable, isNotNullNorUndefinedNorEmpty, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { EntrepriseId, entrepriseIdValidator } from 'camino-common/src/entreprise'
import { CaminoDate } from 'camino-common/src/date'
import { TitreId } from 'camino-common/src/validators/titres'

const getUtilisateursValidator = z.object({
  id: utilisateurIdValidator,
  email: z.string(),
  nom: z.string(),
  prenom: z.string().nullable(),
  telephone_fixe: z.string().nullable(),
  telephone_mobile: z.string().nullable(),
  role: roleValidator,
  administration_id: administrationIdValidator.nullable(),
  entreprise_ids: z.array(entrepriseIdValidator).nullable(),
})
export type GetUtilisateur = z.infer<typeof getUtilisateursValidator>

type GetUtilisateursFilteredAndSortedErrors = DbQueryAccessError | ZodUnparseable | 'droits insuffisants'
export const getUtilisateursFilteredAndSorted = (
  pool: Pool,
  user: DeepReadonly<User>,
  searchParams: UtilisateursSearchParams
): Effect.Effect<UserNotNull[], CaminoError<GetUtilisateursFilteredAndSortedErrors>> => {
  return Effect.Do.pipe(
    Effect.filterOrFail(
      () => canReadUtilisateurs(user),
      () => ({ message: 'droits insuffisants' as const })
    ),
    Effect.flatMap(() => effectDbQueryAndValidate(getUtilisateursDb, undefined, pool, getUtilisateursValidator)),
    Effect.map(utilisateurs => {
      return utilisateurs.filter(utilisateur => {
        return filterUtilisateur(utilisateur, searchParams)
      })
    }),
    Effect.flatMap(utilisateurs => {
      return Effect.forEach(utilisateurs, u => {
        return pipe(
          zodParseEffect(userNotNullValidator, userDbToUser(u)),
          Effect.mapError(error => {
            return { ...error, extra: { email: u.email } }
          })
        )
      })
    }),
    Effect.map(utilisateurs => {
      return utilisateurs.filter(utilisateur => {
        return canReadUtilisateur(user, utilisateur)
      })
    }),
    Effect.map(utilisateurs => {
      return utilisateurs.toSorted((a, b) => {
        const result = a[searchParams.colonne].localeCompare(b[searchParams.colonne])

        return result * (searchParams.ordre === 'asc' ? 1 : -1)
      })
    })
  )
}

// VISIBLE FOR TESTING
export const filterUtilisateur = (utilisateur: GetUtilisateur, params: Omit<UtilisateursSearchParamsInput, 'page' | 'intervalle' | 'colonne' | 'ordre'>): boolean => {
  // On filtre en fonction des filtres sélectionnés
  if (isNotNullNorUndefinedNorEmpty(params.administrationIds) && !params.administrationIds.includes(utilisateur.administration_id)) {
    return false
  }

  if (
    isNotNullNorUndefinedNorEmpty(params.entreprisesIds) &&
    (isNullOrUndefinedOrEmpty(utilisateur.entreprise_ids) || utilisateur.entreprise_ids.every(eId => !(params.entreprisesIds ?? []).includes(eId)))
  ) {
    return false
  }

  if (isNotNullNorUndefinedNorEmpty(params.roles) && !params.roles.includes(utilisateur.role)) {
    return false
  }

  if (
    isNotNullNorUndefinedNorEmpty(params.nomsUtilisateurs) &&
    !utilisateur.nom.toLowerCase().includes(params.nomsUtilisateurs.toLowerCase()) &&
    (isNullOrUndefinedOrEmpty(utilisateur.prenom) || !(utilisateur.prenom ?? '').toLowerCase().includes(params.nomsUtilisateurs.toLowerCase()))
  ) {
    return false
  }

  if (isNotNullNorUndefinedNorEmpty(params.emails) && !utilisateur.email.toLowerCase().includes(params.emails.toLowerCase())) {
    return false
  }

  return true
}

const getUtilisateursDb = sql<Redefine<IGetUtilisateursDbQuery, undefined, GetUtilisateur>>`
  select
    id,
    email,
    nom,
    prenom,
    telephone_fixe,
    telephone_mobile,
    role,
    administration_id,
    (select array_agg(entreprise_id) from utilisateurs__entreprises where utilisateur_id = id) as entreprise_ids
  from utilisateurs
  where keycloak_id is not null`

const emailValidator = z.object({ email: z.string() })
export const getUtilisateursEmailsByEntrepriseIds = async (pool: Pool, entrepriseIds: NonEmptyArray<EntrepriseId>): Promise<string[]> => {
  const result = await dbQueryAndValidate(getUtilisateursEmailsByEntrepriseIdsDb, { entrepriseIds }, pool, emailValidator)

  return result.map(({ email }) => email)
}

const getUtilisateursEmailsByEntrepriseIdsDb = sql<Redefine<IGetUtilisateursEmailsByEntrepriseIdsDbQuery, { entrepriseIds: EntrepriseId[] }, z.infer<typeof emailValidator>>>`
  select u.email from utilisateurs u join utilisateurs__entreprises ue on ue.utilisateur_id = u.id where ue.entreprise_id in $$entrepriseIds AND u.keycloak_id is not null`

/**
 * @deprecated use newGetUtilisateurById
 **/
export const getUtilisateurById = async (pool: Pool, id: UtilisateurId, user: User): Promise<User> => {
  try {
    return await callAndExit(newGetUtilisateurById(pool, id, user), async r => r)
  } catch (_e) {
    return null
  }
}

const userDbToUser = (
  user: DeepReadonly<GetUtilisateur>
): DeepReadonly<
  Pick<UserNotNull, 'telephone_fixe' | 'telephone_mobile' | 'id' | 'nom' | 'prenom' | 'role' | 'email'> &
    Nullable<Pick<AdminUserNotNull, 'administrationId'>> &
    Pick<EntrepriseUserNotNull, 'entrepriseIds'>
> => {
  return { ...user, prenom: user.prenom ?? '', entrepriseIds: user.entreprise_ids ?? [], administrationId: user.administration_id }
}

export const newGetUtilisateurById = (
  pool: Pool,
  id: UtilisateurId,
  user: DeepReadonly<User>
): Effect.Effect<UserNotNull, CaminoError<'droits insuffisants' | DbQueryAccessError | ZodUnparseable>> => {
  return pipe(
    effectDbQueryAndValidate(getUtilisateurByIdDb, { id }, pool, getUtilisateursValidator),
    Effect.filterOrFail(
      utilisateurs => isNotNullNorUndefinedNorEmpty(utilisateurs),
      () => ({ message: 'droits insuffisants' as const })
    ),
    Effect.flatMap(utilisateurs => {
      return zodParseEffect(userNotNullValidator, userDbToUser(utilisateurs[0]))
    }),
    Effect.filterOrFail(
      utilisateur => canReadUtilisateur(user, utilisateur),
      () => ({ message: 'droits insuffisants' as const })
    )
  )
}
const getUtilisateurByIdDb = sql<Redefine<IGetUtilisateurByIdDbQuery, { id: UtilisateurId }, GetUtilisateur>>`
  select
    id,
    email,
    nom,
    prenom,
    telephone_fixe,
    telephone_mobile,
    role,
    administration_id,
    (select array_agg(entreprise_id) from utilisateurs__entreprises where utilisateur_id = id) as entreprise_ids
  from utilisateurs
  where id = $id!
  and keycloak_id is not null
  limit 1`

const getKeycloakIdByUserIdValidator = z.object({ keycloak_id: z.string() })
type GetKeycloakIdByUser = z.infer<typeof getKeycloakIdByUserIdValidator>
export const getKeycloakIdByUserId = async (pool: Pool, utilisateurId: UtilisateurId): Promise<string | null> => {
  const result = await dbQueryAndValidate(getKeycloakIdByUserIdDb, { id: utilisateurId }, pool, getKeycloakIdByUserIdValidator)

  return isNullOrUndefinedOrEmpty(result) ? null : result[0].keycloak_id
}

const getKeycloakIdByUserIdDb = sql<Redefine<IGetKeycloakIdByUserIdDbQuery, { id: UtilisateurId }, GetKeycloakIdByUser>>`
  select
    keycloak_id
  from utilisateurs
  where id = $id!
  limit 1`

const getUtilisateurByEmailValidator = getUtilisateursValidator.pick({ nom: true, prenom: true, email: true }).and(
  z.object({
    keycloak_id: z.string().nullable(),
    qgis_token: z.string().nullable(),
  })
)

export type GetUtilisateurByEmail = z.infer<typeof getUtilisateurByEmailValidator>

export const getUtilisateurByEmail = async (pool: Pool, email: string): Promise<GetUtilisateurByEmail | null> => {
  const result = await dbQueryAndValidate(getUtilisateurByEmailDb, { email }, pool, getUtilisateurByEmailValidator)

  return isNullOrUndefinedOrEmpty(result) ? null : result[0]
}

const getUtilisateurByEmailDb = sql<Redefine<IGetUtilisateurByEmailDbQuery, { email: string }, GetUtilisateurByEmail>>`
  select
    u.nom,
    u.prenom,
    u.keycloak_id,
    u.qgis_token,
    u.email
  from utilisateurs u
  where u.email = $email!
  and keycloak_id is not null
  limit 1
  `

export const getUtilisateurByKeycloakId = async (pool: Pool, keycloakId: string): Promise<User> => {
  const result = await dbQueryAndValidate(getUtilisateurByKeycloakIdDb, { keycloakId }, pool, getUtilisateursValidator)

  if (isNullOrUndefinedOrEmpty(result)) {
    return null
  }

  const utilisateurNotNull: UserNotNull = userNotNullValidator.parse(userDbToUser(result[0]))

  return utilisateurNotNull
}

const getUtilisateurByKeycloakIdDb = sql<Redefine<IGetUtilisateurByKeycloakIdDbQuery, { keycloakId: string }, GetUtilisateur>>`
  select
     id,
     email,
     nom,
     prenom,
     telephone_fixe,
     telephone_mobile,
     role,
     administration_id,
     (select array_agg(entreprise_id) from utilisateurs__entreprises where utilisateur_id = id) as entreprise_ids
  from utilisateurs u
  where u.keycloak_id = $keycloakId!
  limit 1
  `

export const getUtilisateursByTitreId = async (pool: Pool, titreId: TitreId): Promise<UserNotNull[]> => {
  const result = await dbQueryAndValidate(getUtilisateurByTitreIdDb, { titreId }, pool, getUtilisateursValidator)

  if (isNullOrUndefinedOrEmpty(result)) {
    return []
  }

  return z.array(userNotNullValidator).parse(result.map(userDbToUser))
}

const getUtilisateurByTitreIdDb = sql<Redefine<IGetUtilisateurByTitreIdDbQuery, { titreId: TitreId }, GetUtilisateur>>`
  select
     u.id,
     u.email,
     u.nom,
     u.prenom,
     u.telephone_fixe,
     u.telephone_mobile,
     u.role,
     u.administration_id,
     (select array_agg(entreprise_id) from utilisateurs__entreprises where utilisateur_id = id) as entreprise_ids
  from utilisateurs__titres ut
  join utilisateurs u on u.id = ut.utilisateur_id
  where ut.titre_id = $titreId! and u.keycloak_id is not null
  `
type CreateUser = UserNotNull & {
  date_creation: CaminoDate
  keycloak_id: string
}

export const createUtilisateur = async (pool: Pool, user: CreateUser): Promise<UserNotNull> => {
  await dbQueryAndValidate(
    createUtilisateurDb,
    {
      ...user,
      administrationId: 'administrationId' in user ? user.administrationId : null,
    },
    pool,
    z.void()
  )

  if (isEntrepriseOrBureauDEtude(user)) {
    for (const entreprise_id of user.entrepriseIds) {
      await dbQueryAndValidate(createUtilisateurEntrepriseDb, { utilisateur_id: user.id, entreprise_id }, pool, z.void())
    }
  }

  return user
}
const createUtilisateurDb = sql<Redefine<ICreateUtilisateurDbQuery, Omit<CreateUser, 'administrationId' | 'entrepriseIds'> & Nullable<Pick<AdminUserNotNull, 'administrationId'>>, void>>`
  insert into utilisateurs (id, email, nom, prenom, role, date_creation, keycloak_id, administration_id, telephone_fixe, telephone_mobile)
  values ($id!, $email!, $nom!, $prenom!, $role!, $date_creation!, $keycloak_id!, $administrationId!, $telephone_fixe!, $telephone_mobile!)
  `

const createUtilisateurEntrepriseDb = sql<Redefine<ICreateUtilisateurEntrepriseDbQuery, { utilisateur_id: UtilisateurId; entreprise_id: EntrepriseId }, void>>`
  insert into utilisateurs__entreprises (utilisateur_id, entreprise_id)
  values ($utilisateur_id!, $entreprise_id!)`

const deleteUtilisateurEntrepriseDb = sql<Redefine<IDeleteUtilisateurEntrepriseDbQuery, { utilisateur_id: UtilisateurId }, void>>`
  delete from utilisateurs__entreprises where utilisateur_id = $utilisateur_id!`

export const updateUtilisateur = async (pool: Pool, user: DeepReadonly<UserNotNull>): Promise<DeepReadonly<UserNotNull>> => {
  await dbQueryAndValidate(updateUtilisateurDb, user, pool, z.void())

  return user
}

const updateUtilisateurDb = sql<Redefine<IUpdateUtilisateurDbQuery, Pick<UserNotNull, 'id' | 'nom' | 'prenom' | 'email'>, void>>`
  update utilisateurs set nom = $nom!, prenom = $prenom!, email = $email! where id = $id!
  `

type UpdateUtilisateurRole = DeepReadonly<Pick<UserNotNull, 'id' | 'role'> & Nullable<Pick<AdminUserNotNull, 'administrationId'>> & Pick<EntrepriseUserNotNull, 'entrepriseIds'>>
export const updateUtilisateurRole = async (pool: Pool, user: UpdateUtilisateurRole): Promise<void> => {
  await dbQueryAndValidate(updateUtilisateurRoleDb, user, pool, z.void())

  await dbQueryAndValidate(deleteUtilisateurEntrepriseDb, { utilisateur_id: user.id }, pool, z.void())

  if (isEntrepriseOrBureauDetudeRole(user.role)) {
    for (const entreprise_id of user.entrepriseIds) {
      await dbQueryAndValidate(createUtilisateurEntrepriseDb, { utilisateur_id: user.id, entreprise_id }, pool, z.void())
    }
  }
}

const updateUtilisateurRoleDb = sql<Redefine<IUpdateUtilisateurRoleDbQuery, Pick<UserNotNull, 'id' | 'role'> & Nullable<Pick<AdminUserNotNull, 'administrationId'>>, void>>`
  update utilisateurs set role = $role!, administration_id = $administrationId! where id = $id!
  `

export const softDeleteUtilisateur = async (pool: Pool, id: UtilisateurId): Promise<void> => {
  await dbQueryAndValidate(softDeleteUtilisateurDb, { id }, pool, z.void())
}

const softDeleteUtilisateurDb = sql<Redefine<ISoftDeleteUtilisateurDbQuery, { id: UtilisateurId }, void>>`
  update utilisateurs set keycloak_id = null, email = null where id = $id!
  `
