import { GraphQLResolveInfo } from 'graphql'
import cryptoRandomString from 'crypto-random-string'

import { Context, formatUser, IUtilisateur, IUtilisateursColonneId } from '../../../types.js'

import { fieldsBuild } from './_fields-build.js'

import { userGet, utilisateurGet, utilisateursCount, utilisateursGet, utilisateurUpsert } from '../../../database/queries/utilisateurs.js'

import { utilisateurUpdationValidate } from '../../../business/validations/utilisateur-updation-validate.js'
import { newsletterSubscriberUpdate } from '../../../tools/api-mailjet/newsletter.js'
import { isAdministrationRole, isEntrepriseOrBureauDetudeRole, Role } from 'camino-common/src/roles.js'
import { canReadUtilisateurs, canReadUtilisateur, canEditUtilisateur } from 'camino-common/src/permissions/utilisateurs.js'

export const userIdGenerate = async (): Promise<string> => {
  const id = cryptoRandomString({ length: 6 })
  const utilisateurWithTheSameId = await userGet(id)
  if (utilisateurWithTheSameId) {
    return userIdGenerate()
  }

  return id
}

export const utilisateur = async ({ id }: { id: string }, { user }: Context, info: GraphQLResolveInfo) => {
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
    entrepriseIds,
    administrationIds,
    roles,
    noms,
    emails,
  }: {
    intervalle?: number | null
    page?: number | null
    colonne?: IUtilisateursColonneId | null
    ordre?: 'asc' | 'desc' | null
    entrepriseIds?: string[]
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
          entrepriseIds,
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
          entrepriseIds,
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

export const utilisateurModifier = async ({ utilisateur }: { utilisateur: IUtilisateur }, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    if (!user) {
      throw new Error('droits insuffisants')
    }
    const utilisateurOld = await userGet(utilisateur.id)

    utilisateurUpdationValidate(user, utilisateur, utilisateurOld)

    // Thanks Objection
    if (!isAdministrationRole(utilisateur.role)) {
      utilisateur.administrationId = null
    }
    if (!isEntrepriseOrBureauDetudeRole(utilisateur.role)) {
      utilisateur.entreprises = []
    }

    const fields = fieldsBuild(info)

    const utilisateurUpdated = await utilisateurUpsert(utilisateur, { fields })

    return utilisateurUpdated
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const utilisateurSupprimer = async ({ id }: { id: string }, { user }: Context) => {
  try {
    if (!user) {
      throw new Error('droits insuffisants')
    }

    const utilisateur = await utilisateurGet(id, { fields: { entreprises: { id: {} } } }, user)

    if (!utilisateur) {
      throw new Error('aucun utilisateur avec cet id')
    }

    if (!canEditUtilisateur(user, formatUser(utilisateur))) {
      throw new Error('droits insuffisants')
    }

    utilisateur.email = null
    utilisateur.telephoneFixe = ''
    utilisateur.telephoneMobile = ''
    utilisateur.role = 'defaut'
    utilisateur.entreprises = []
    utilisateur.administrationId = undefined

    const utilisateurUpdated = await utilisateurUpsert(utilisateur, {})

    return utilisateurUpdated
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
