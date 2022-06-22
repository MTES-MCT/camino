import { GraphQLResolveInfo } from 'graphql'
import cryptoRandomString from 'crypto-random-string'

import {
  Context,
  formatUser,
  IUtilisateur,
  IUtilisateurCreation,
  IUtilisateursColonneId
} from '../../../types.js'

import { emailsSend } from '../../../tools/api-mailjet/emails.js'
import { fieldsBuild } from './_fields-build.js'

import {
  userByEmailGet,
  userGet,
  utilisateurCreate,
  utilisateurGet,
  utilisateursCount,
  utilisateursGet,
  utilisateurUpsert
} from '../../../database/queries/utilisateurs.js'

import { utilisateurUpdationValidate } from '../../../business/validations/utilisateur-updation-validate.js'
import { utilisateurEditionCheck } from '../../_permissions/utilisateur.js'
import { newsletterSubscriberUpdate } from '../../../tools/api-mailjet/newsletter.js'
import {
  isAdministrationAdmin,
  isAdministrationAdminRole,
  isAdministrationRole,
  isEntrepriseOrBureauDetudeRole,
  isSuper,
  isSuperRole,
  Role
} from 'camino-common/src/roles.js'
import { getCurrent } from 'camino-common/src/date.js'
import {
  canReadUtilisateurs,
  canCreateUtilisateur,
  canReadUtilisateur
} from 'camino-common/src/permissions/utilisateurs.js'

export const userIdGenerate = async (): Promise<string> => {
  const id = cryptoRandomString({ length: 6 })
  const utilisateurWithTheSameId = await userGet(id)
  if (utilisateurWithTheSameId) {
    return userIdGenerate()
  }

  return id
}

const utilisateur = async (
  { id }: { id: string },
  { user }: Context,
  info: GraphQLResolveInfo
) => {
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

const utilisateurs = async (
  {
    intervalle,
    page,
    colonne,
    ordre,
    entrepriseIds,
    administrationIds,
    roles,
    noms,
    emails
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
          emails
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
          emails
        },
        { fields: {} },
        user
      )
    ])

    return {
      elements: utilisateurs,
      page,
      intervalle,
      ordre,
      colonne,
      total
    }
  } catch (e) {
    console.error(e)

    throw e
  }
}

const moi = async (_: never, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    if (!user) return null

    const fields = fieldsBuild(info)

    const utilisateur = await utilisateurGet(user.id, { fields }, user)

    return formatUser(utilisateur!)
  } catch (e) {
    console.error(e)

    throw e
  }
}

const utilisateurCreer = async (
  { utilisateur }: { utilisateur: IUtilisateurCreation; token?: string },
  { user }: Context
) => {
  try {
    utilisateur.email = utilisateur.email!.toLowerCase()

    if (
      !user ||
      (user.email !== utilisateur.email && !canCreateUtilisateur(user)) ||
      (!isSuper(user) && isSuperRole(utilisateur.role))
    )
      throw new Error('droits insuffisants')

    const errors = utilisateurEditionCheck(utilisateur)

    const utilisateurWithTheSameEmail = await userByEmailGet(utilisateur.email!)

    if (utilisateurWithTheSameEmail) {
      errors.push('un utilisateur avec cet email existe déjà')
    }

    if (errors.length) {
      throw new Error(errors.join(', '))
    }

    if (
      !utilisateur.role ||
      !user ||
      !(isSuper(user) || isAdministrationAdmin(user))
    ) {
      utilisateur.role = 'defaut'
    }

    if (!isAdministrationRole(utilisateur.role)) {
      utilisateur.administrationId = undefined
    }

    if (!isEntrepriseOrBureauDetudeRole(utilisateur.role)) {
      utilisateur.entreprises = []
    }

    const utilisateurUpdated = await utilisateurCreate(
      {
        id: await userIdGenerate(),
        ...utilisateur,
        dateCreation: getCurrent()
      } as IUtilisateur,
      { fields: {} }
    )

    emailsSend(
      [process.env.ADMIN_EMAIL!],
      `Nouvel utilisateur ${utilisateurUpdated.email} créé`,
      `L'utilisateur ${utilisateurUpdated.nom} ${utilisateurUpdated.prenom} vient de se créer un compte : ${process.env.OAUTH_URL}/utilisateurs/${utilisateurUpdated.id}`
    )

    return utilisateurUpdated
  } catch (e) {
    console.error(e)

    throw e
  }
}

const utilisateurModifier = async (
  { utilisateur }: { utilisateur: IUtilisateur },
  { user }: Context,
  info: GraphQLResolveInfo
) => {
  try {
    const isAdmin = isAdministrationAdmin(user)

    if (
      !user ||
      (!canCreateUtilisateur(user) &&
        (user.id !== utilisateur.id || user.email !== utilisateur.email)) ||
      (utilisateur.role &&
        !isSuper(user) &&
        (!isAdmin ||
          isSuperRole(utilisateur.role) ||
          isAdministrationAdminRole(utilisateur.role)))
    ) {
      throw new Error('droits insuffisants')
    }

    const errors = utilisateurEditionCheck(utilisateur)

    const errorsValidate = await utilisateurUpdationValidate(user, utilisateur)

    if (errorsValidate.length) {
      errors.push(...errorsValidate)
    }

    if (errors.length) {
      throw new Error(errors.join(', '))
    }

    if (!isAdministrationRole(utilisateur.role)) {
      utilisateur.administrationId = undefined
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

const utilisateurSupprimer = async (
  { id }: { id: string },
  { user }: Context
) => {
  try {
    if (!user || (!canCreateUtilisateur(user) && user.id !== id))
      throw new Error('droits insuffisants')

    const utilisateur = await utilisateurGet(id, { fields: {} }, user)

    if (!utilisateur) {
      throw new Error('aucun utilisateur avec cet id')
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

const newsletterInscrire = async ({ email }: { email: string }) => {
  try {
    return await newsletterSubscriberUpdate(email, true)
  } catch (e) {
    console.error(e)

    throw e
  }
}

export {
  utilisateur,
  utilisateurs,
  moi,
  utilisateurCreer,
  utilisateurModifier,
  utilisateurSupprimer,
  newsletterInscrire
}
