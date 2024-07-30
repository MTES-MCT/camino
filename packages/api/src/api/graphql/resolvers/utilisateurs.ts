import { GraphQLResolveInfo } from 'graphql'

import { Context, IUtilisateursColonneId } from '../../../types'

import { fieldsBuild } from './_fields-build'

import { userGet, utilisateurGet, utilisateursCount, utilisateursGet } from '../../../database/queries/utilisateurs'

import { Role, UtilisateurId } from 'camino-common/src/roles'
import { canReadUtilisateurs, canReadUtilisateur } from 'camino-common/src/permissions/utilisateurs'
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
): Promise<{
  elements: Utilisateurs[]
  page: number | null | undefined
  intervalle: number | null | undefined
  ordre: 'asc' | 'desc' | null | undefined
  colonne: IUtilisateursColonneId | null | undefined
  total: number
}> => {
  try {
    if (!canReadUtilisateurs(user)) {
      return {
        elements: [],
        page,
        intervalle,
        ordre,
        colonne,
        total: 0,
      }
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
