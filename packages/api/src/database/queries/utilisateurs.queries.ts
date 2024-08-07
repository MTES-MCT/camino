import { sql } from '@pgtyped/runtime'
import { Effect, pipe } from 'effect'
import { DbQueryAccessError, Redefine, dbQueryAndValidate, effectDbQueryAndValidate } from '../../pg-database'
import {
  AdminUserNotNull,
  EntrepriseUserNotNull,
  User,
  isAdministrationEditeur,
  isAdministrationLecteur,
  isBureauDEtudes,
  isEntreprise,
  roleValidator,
  utilisateurIdValidator,
} from 'camino-common/src/roles'
import { z } from 'zod'
import { CaminoError } from 'camino-common/src/zod-tools'
import { Pool } from 'pg'
import { administrationIdValidator } from 'camino-common/src/static/administrations'
import { canReadUtilisateurs } from 'camino-common/src/permissions/utilisateurs'
import { UtilisateursSearchParamsInput, UtilisateursSearchParams, Utilisateur, utilisateurValidator } from 'camino-common/src/utilisateur'
import { IGetUtilisateursDbQuery, IGetUtilisateursEmailsByEntrepriseIdsDbQuery } from './utilisateurs.queries.types'
import { ZodUnparseable, zodParseEffect } from '../../tools/fp-tools'
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
): Effect.Effect<Utilisateur[], CaminoError<GetUtilisateursFilteredAndSortedErrors>> => {
  return Effect.Do.pipe(
    Effect.filterOrFail(
      () => canReadUtilisateurs(user),
      () => ({ message: 'droits insuffisants' as const })
    ),
    Effect.flatMap(() => effectDbQueryAndValidate(getUtilisateursDb, undefined, pool, getUtilisateursValidator)),
    Effect.map(utilisateurs => {
      return utilisateurs.filter(utilisateur => {
        return filterUtilisateur(utilisateur, searchParams, user)
      })
    }),
    Effect.flatMap(utilisateurs => {
      return Effect.forEach(utilisateurs, u => {
        const obj: Pick<Utilisateur, 'telephoneFixe' | 'telephoneMobile' | 'id' | 'nom' | 'prenom' | 'role' | 'email'> &
          Nullable<Pick<AdminUserNotNull, 'administrationId'>> &
          Pick<EntrepriseUserNotNull, 'entreprises'> = {
          ...u,
          telephoneMobile: u.telephone_mobile,
          telephoneFixe: u.telephone_fixe,
          administrationId: u.administration_id,
          entreprises: u.entreprise_ids?.map(id => ({ id })) ?? [],
          prenom: u.prenom ?? '',
        }

        return pipe(
          zodParseEffect(utilisateurValidator, obj),
          Effect.mapError(error => {
            return { ...error, extra: { email: u.email } }
          })
        )
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
export const filterUtilisateur = (utilisateur: GetUtilisateur, params: Omit<UtilisateursSearchParamsInput, 'page' | 'intervalle' | 'colonne' | 'ordre'>, user: DeepReadonly<User>): boolean => {
  // On filtre en fonction du user connecté
  if (isAdministrationEditeur(user) || isAdministrationLecteur(user)) {
    // un utilisateur 'editeur' ou 'lecteur'
    // ne voit que les utilisateurs de son administration
    if (utilisateur.administration_id !== user.administrationId) {
      return false
    }
  } else if ((isEntreprise(user) || isBureauDEtudes(user)) && user.entreprises.length) {
    // un utilisateur entreprise
    // ne voit que les utilisateurs de son entreprise
    const entreprisesIds = user.entreprises.map(e => e.id)
    if (entreprisesIds.every(eId => !(utilisateur.entreprise_ids ?? []).includes(eId))) {
      return false
    }
  }

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
