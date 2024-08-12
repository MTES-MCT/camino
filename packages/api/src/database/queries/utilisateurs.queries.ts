import { sql } from '@pgtyped/runtime'
import { Effect, pipe } from 'effect'
import { DbQueryAccessError, Redefine, dbQueryAndValidate, effectDbQueryAndValidate } from '../../pg-database'
import { AdminUserNotNull, BaseUserNotNull, EntrepriseUserNotNull, User, UserNotNull, UtilisateurId, roleValidator, userNotNullValidator, utilisateurIdValidator } from 'camino-common/src/roles'
import { z } from 'zod'
import { CaminoError } from 'camino-common/src/zod-tools'
import { Pool } from 'pg'
import { administrationIdValidator } from 'camino-common/src/static/administrations'
import { canReadUtilisateur, canReadUtilisateurs } from 'camino-common/src/permissions/utilisateurs'
import { UtilisateursSearchParamsInput, UtilisateursSearchParams } from 'camino-common/src/utilisateur'
import {
  IGetKeycloakIdByUserIdDbQuery,
  IGetUtilisateurByEmailDbQuery,
  IGetUtilisateurByIdDbQuery,
  IGetUtilisateurByKeycloakIdDbQuery,
  IGetUtilisateursDbQuery,
  IGetUtilisateursEmailsByEntrepriseIdsDbQuery,
} from './utilisateurs.queries.types'
import { ZodUnparseable, callAndExit, zodParseEffect } from '../../tools/fp-tools'
import { DeepReadonly, NonEmptyArray, Nullable, isNotNullNorUndefinedNorEmpty, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { EntrepriseId, entrepriseIdValidator } from 'camino-common/src/entreprise'

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
        const obj: Pick<UserNotNull, 'telephone_fixe' | 'telephone_mobile' | 'id' | 'nom' | 'prenom' | 'role' | 'email'> &
          Nullable<Pick<AdminUserNotNull, 'administrationId'>> &
          Pick<EntrepriseUserNotNull, 'entreprises'> = {
          ...u,
          administrationId: u.administration_id,
          entreprises: u.entreprise_ids?.map(id => ({ id })) ?? [],
          prenom: u.prenom ?? '',
        }

        return pipe(
          zodParseEffect(userNotNullValidator, obj),
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
      const utilisateur = {
        ...utilisateurs[0],
        prenom: utilisateurs[0].prenom ?? '',
        entreprises: utilisateurs[0].entreprise_ids?.map(id => ({ id })),
        administrationId: utilisateurs[0].administration_id,
      }

      return zodParseEffect(userNotNullValidator, utilisateur)
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

  const utilisateur: BaseUserNotNull = { ...result[0], prenom: result[0].prenom ?? '' }
  const utilisateurNotNull: UserNotNull = userNotNullValidator.parse(utilisateur)

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
