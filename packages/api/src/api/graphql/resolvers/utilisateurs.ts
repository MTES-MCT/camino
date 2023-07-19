import { GraphQLResolveInfo } from 'graphql'

import { Context, IUtilisateursColonneId } from '../../../types.js'

import { fieldsBuild } from './_fields-build.js'

import { userGet, utilisateurGet, utilisateursCount, utilisateursGet } from '../../../database/queries/utilisateurs.js'

import { newsletterSubscriberUpdate } from '../../../tools/api-mailjet/newsletter.js'
import { Role, UtilisateurId } from 'camino-common/src/roles.js'
import { canReadUtilisateurs, canReadUtilisateur } from 'camino-common/src/permissions/utilisateurs.js'
import { newUtilisateurId } from '../../../database/models/_format/id-create.js'

export const userIdGenerate = async (): Promise<UtilisateurId> => {
  const id = newUtilisateurId()
  const utilisateurWithTheSameId = await userGet(id)
  if (utilisateurWithTheSameId) {
    return userIdGenerate()
  }

  return id
}

export const utilisateur = async ({ id }: { id: UtilisateurId }, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    if (!canReadUtilisateur(user, id)) {
      return null
    }
    const fields = fieldsBuild(info)

    return await utilisateurGet(id, { fields }, user)
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const utilisateurs = async (
  {
    intervalle,
    page,
    colonne,
    ordre,
    entreprisesIds,
    administrationIds,
    roles,
    noms,
    emails,
  }: {
    intervalle?: number | null
    page?: number | null
    colonne?: IUtilisateursColonneId | null
    ordre?: 'asc' | 'desc' | null
    entreprisesIds?: string[]
    administrationIds?: string[]
    roles?: Role[]
    noms?: string | null
    emails?: string | null
  },
  { user }: Context,
  info: GraphQLResolveInfo
) => {
  try {
    if (!canReadUtilisateurs(user)) {
      return []
    }
    const fields = fieldsBuild(info)

    const [utilisateurs, total] = await Promise.all([
      utilisateursGet(
        {
          intervalle,
          page,
          colonne,
          ordre,
          entreprisesIds,
          administrationIds,
          roles,
          noms,
          emails,
        },
        { fields: fields.elements },
        user
      ),
      utilisateursCount(
        {
          entreprisesIds,
          administrationIds,
          roles,
          noms,
          emails,
        },
        { fields: {} },
        user
      ),
    ])

    return {
      elements: utilisateurs,
      page,
      intervalle,
      ordre,
      colonne,
      total,
    }
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const newsletterInscrire = async ({ email }: { email: string }) => {
  try {
    return await newsletterSubscriberUpdate(email, true)
  } catch (e) {
    console.error(e)

    throw e
  }
}
