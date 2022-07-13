import { GraphQLResolveInfo } from 'graphql'
import cryptoRandomString from 'crypto-random-string'

import {
  Context,
  formatUser,
  IUtilisateur,
  IUtilisateurCreation,
  IUtilisateursColonneId
} from '../../../types'

import { login as cerbereLogin } from '../../../tools/api-cerbere/index'

import { cacheInit } from '../../../database/init'

import { debug } from '../../../config/index'
import { emailsSend } from '../../../tools/api-mailjet/emails'
import { fieldsBuild } from './_fields-build'

import {
  userByEmailGet,
  userGet,
  utilisateurCreate,
  utilisateurGet,
  utilisateursCount,
  utilisateursGet,
  utilisateurUpdate,
  utilisateurUpsert
} from '../../../database/queries/utilisateurs'

import { globales } from '../../../database/cache/globales'

import { utilisateurUpdationValidate } from '../../../business/validations/utilisateur-updation-validate'
import { utilisateurEditionCheck } from '../../_permissions/utilisateur'
import { userFormat } from '../../_format/users'
import {
  newsletterSubscriberCheck,
  newsletterSubscriberUpdate
} from '../../../tools/api-mailjet/newsletter'
import dateFormat from 'dateformat'
import {
  isAdministrationAdmin,
  isAdministrationAdminRole,
  isAdministrationRole,
  isEntrepriseOrBureauDetudeRole,
  isSuper,
  isSuperRole,
  Role,
  User
} from 'camino-common/src/roles'

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
    const fields = fieldsBuild(info)

    return await utilisateurGet(id, { fields }, user)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

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
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const moi = async (_: never, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    // vérifie que la base de données est remplie au démarrage du serveur
    // TODO:
    // mettre ça dans un middleware à la racine de l'app express
    if (!globales.chargement) {
      await cacheInit()
    }

    if (!user) return null

    const fields = fieldsBuild(info)

    const utilisateur = await utilisateurGet(user.id, { fields }, user)

    return userFormat(formatUser(utilisateur!))
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const utilisateurCerbereUrlObtenir = async ({ url }: { url: string }) => {
  try {
    return `${process.env.API_CERBERE}?service=${url}`
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const utilisateurCerbereConnecter = async (
  { ticket }: { ticket: string },
  _: Context,
  info: GraphQLResolveInfo
) => {
  try {
    // authentification cerbere et récuperation de l'utilisateur
    const cerbereUtilisateur = await cerbereLogin(ticket)

    if (!cerbereUtilisateur) {
      throw new Error('aucun utilisateur sur Cerbère')
    }

    let user = await userByEmailGet(cerbereUtilisateur.email!)

    // si l'utilisateur n'existe pas encore en base
    // alors on le crée en lui générant un mot de passe aléatoire
    if (!user) {
      cerbereUtilisateur.motDePasse = cryptoRandomString({ length: 16 })

      user = await utilisateurCreer({ utilisateur: cerbereUtilisateur }, {
        user: { email: cerbereUtilisateur.email! }
      } as Context)
    }

    const fields = fieldsBuild(info)

    const utilisateur = await utilisateurGet(
      user.id,
      { fields: fields.utilisateur },
      user as User
    )

    return userFormat(formatUser(utilisateur!))
  } catch (e) {
    if (debug) {
      console.error(e)
    }

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
      (user.email !== utilisateur.email && !user?.utilisateursCreation) ||
      (!isSuper(user) && isSuperRole(utilisateur.role))
    )
      throw new Error('droits insuffisants')

    const errors = utilisateurEditionCheck(utilisateur)

    if (utilisateur.motDePasse!.length < 8) {
      errors.push('le mot de passe doit contenir au moins 8 caractères')
    }

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

    utilisateur.motDePasse = 'TODO'

    if (!utilisateur.newsletter) {
      utilisateur.newsletter = await newsletterSubscriberCheck(
        utilisateur.email
      )
    }

    const utilisateurUpdated = await utilisateurCreate(
      {
        id: await userIdGenerate(),
        ...utilisateur,
        dateCreation: dateFormat(new Date(), 'dd-mm-yyyy')
      } as IUtilisateur,
      { fields: {} }
    )

    emailsSend(
      [process.env.ADMIN_EMAIL!],
      `Nouvel utilisateur ${utilisateurUpdated.email} créé`,
      `L'utilisateur ${utilisateurUpdated.nom} ${utilisateurUpdated.prenom} vient de se créer un compte : ${process.env.UI_URL}/utilisateurs/${utilisateurUpdated.id}`
    )

    return utilisateurUpdated
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const utilisateurModifier = async (
  { utilisateur }: { utilisateur: IUtilisateur },
  { user }: Context,
  info: GraphQLResolveInfo
) => {
  try {
    utilisateur.email = utilisateur.email!.toLowerCase()

    const isAdmin = isAdministrationAdmin(user)

    if (
      !user ||
      (!user.utilisateursCreation &&
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

    const utilisateurWithTheSameEmail = await userByEmailGet(utilisateur.email)
    if (
      utilisateurWithTheSameEmail &&
      utilisateur.id !== utilisateurWithTheSameEmail.id
    ) {
      errors.push('un utilisateur avec cet email existe déjà')
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

    newsletterSubscriberUpdate(
      utilisateurUpdated.email!,
      !!utilisateurUpdated.newsletter
    )

    return utilisateurUpdated
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const utilisateurSupprimer = async (
  { id }: { id: string },
  { user }: Context
) => {
  try {
    if (!user || (!user.utilisateursCreation && user.id !== id))
      throw new Error('droits insuffisants')

    const utilisateur = await utilisateurGet(id, { fields: {} }, user)

    if (!utilisateur) {
      throw new Error('aucun utilisateur avec cet id')
    }

    utilisateur.email = null
    utilisateur.motDePasse = 'suppression'
    utilisateur.telephoneFixe = ''
    utilisateur.telephoneMobile = ''
    utilisateur.role = 'defaut'
    utilisateur.entreprises = []
    utilisateur.administrationId = undefined

    const utilisateurUpdated = await utilisateurUpsert(utilisateur, {})

    return utilisateurUpdated
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

const newsletterInscrire = async ({ email }: { email: string }) => {
  try {
    const utilisateur = await userByEmailGet(email)

    if (utilisateur?.newsletter) {
      return 'email inscrit à la newsletter'
    }

    if (utilisateur) {
      await utilisateurUpdate(utilisateur.id, { newsletter: true })
    }

    return newsletterSubscriberUpdate(email, true)
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    throw e
  }
}

export {
  utilisateur,
  utilisateurs,
  moi,
  utilisateurCerbereUrlObtenir,
  utilisateurCerbereConnecter,
  utilisateurCreer,
  utilisateurModifier,
  utilisateurSupprimer,
  newsletterInscrire
}
