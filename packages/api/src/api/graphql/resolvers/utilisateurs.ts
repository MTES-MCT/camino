import { GraphQLResolveInfo } from 'graphql'

import { Context } from '../../../types'

import { fieldsBuild } from './_fields-build'

import { userGet, utilisateurGet } from '../../../database/queries/utilisateurs'

import { UtilisateurId } from 'camino-common/src/roles'
import { canReadUtilisateur } from 'camino-common/src/permissions/utilisateurs'
import { newUtilisateurId } from '../../../database/models/_format/id-create'
import Utilisateurs from '../../../database/models/utilisateurs'

export const userIdGenerate = async (): Promise<UtilisateurId> => {
  const id = newUtilisateurId()
  const utilisateurWithTheSameId = await userGet(id)
  if (utilisateurWithTheSameId) {
    return userIdGenerate()
  }

  return id
}

export const utilisateur = async ({ id }: { id: UtilisateurId }, { user }: Context, info: GraphQLResolveInfo): Promise<Utilisateurs | null | undefined> => {
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
