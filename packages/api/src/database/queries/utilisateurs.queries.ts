import { sql } from '@pgtyped/runtime'
import { Effect  } from 'effect'
import { DbQueryAccessError, Redefine, effectDbQueryAndValidate } from '../../pg-database'
import { User, isAdministrationEditeur, isAdministrationLecteur, isBureauDEtudes, isEntreprise, roleValidator, utilisateurIdValidator } from 'camino-common/src/roles'
import { z } from 'zod'
import { CaminoError } from 'camino-common/src/zod-tools'
import { Pool } from 'pg'
import { administrationIdValidator } from 'camino-common/src/static/administrations'
import { canReadUtilisateurs } from 'camino-common/src/permissions/utilisateurs'
import { UtilisateursSearchParamsInput, UtilisateursSearchParams } from 'camino-common/src/utilisateur'
import { IGetUtilisateursDbQuery } from './utilisateurs.queries.types'
import { ZodUnparseable } from '../../tools/fp-tools'
import { DeepReadonly, isNotNullNorUndefinedNorEmpty, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'

const getUtilisateursValidator = z.object({
  id: utilisateurIdValidator,
  email: z.string(),
  nom: z.string(),
  prenom: z.string(),
  telephone_fixe: z.string(),
  telephone_mobile: z.string(),
  role: roleValidator,
  administration_id: administrationIdValidator.nullable(),
  entreprise_ids: z.array(entrepriseIdValidator).nullable(),
})
export type GetUtilisateur = z.infer<typeof getUtilisateursValidator>

type GetUtilisateursFilteredErrors = DbQueryAccessError | ZodUnparseable | 'droits insuffisants'
export const getUtilisateursFiltered = (pool: Pool, user: DeepReadonly<User>, params: UtilisateursSearchParams): Effect.Effect<GetUtilisateur[], CaminoError<GetUtilisateursFilteredErrors>> => {
  return Effect.Do.pipe(
    Effect.filterOrFail(
      () => canReadUtilisateurs(user),
      () => ({ message: 'droits insuffisants' as const })
    ),
    Effect.flatMap(() => effectDbQueryAndValidate(getUtilisateursDb, {orderBy: `${params.colonne} ${params.ordre}`}, pool, getUtilisateursValidator)),
    Effect.map((utilisateurs) => {
      return utilisateurs.filter((utilisateur) => {

        return filterUtilisateur(utilisateur, params, user)
      })
    }),
    //FIXME map pour userNotNullValidator
  )
}


// VISIBLE FOR TESTING
export const filterUtilisateur = (utilisateur: GetUtilisateur, params: Omit<UtilisateursSearchParamsInput, 'page' | 'intervalle' | 'colonne' | 'ordre' >, user: DeepReadonly<User>): boolean => {

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
    if (entreprisesIds.every(eId => !(utilisateur.entreprise_ids ?? []).includes(eId))){
      return false
    }
  }


  // On filtre en fonction des filtres sélectionnés
  if (isNotNullNorUndefinedNorEmpty(params.administrationIds) && !params.administrationIds.includes(utilisateur.administration_id)) {
    return false
  }

  if (isNotNullNorUndefinedNorEmpty(params.entreprisesIds) && (isNullOrUndefinedOrEmpty(utilisateur.entreprise_ids) || utilisateur.entreprise_ids.every(eId => !(params.entreprisesIds ?? []).includes(eId)))) {
    return false
  }

  if (isNotNullNorUndefinedNorEmpty(params.roles) && !params.roles.includes(utilisateur.role)) {
    return false
  }

  if (isNotNullNorUndefinedNorEmpty(params.noms) && !utilisateur.nom.toLowerCase().includes(params.noms.toLowerCase()) && !utilisateur.prenom.toLowerCase().includes(params.noms.toLowerCase()) ){
    return false
  }

  if (isNotNullNorUndefinedNorEmpty(params.emails) && !utilisateur.email.toLowerCase().includes(params.emails.toLowerCase())){
    return false
  }

  return true
}

const getUtilisateursDb = sql<Redefine<IGetUtilisateursDbQuery, {orderBy: `${UtilisateursSearchParams['colonne']} ${UtilisateursSearchParams['ordre']}`}, GetUtilisateur>>`
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
  where keycloak_id is not null
  order by $orderBy!`
