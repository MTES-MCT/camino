import { userGet, utilisateurGet, utilisateursGet, utilisateurUpsert } from '../../database/queries/utilisateurs.js'
import { CaminoRequest, CustomResponse } from './express-type.js'
import { formatUser, IUtilisateursColonneId } from '../../types.js'
import { constants } from 'http2'
import { isSubscribedToNewsLetter, newsletterSubscriberUpdate } from '../../tools/api-mailjet/newsletter.js'
import { isAdministrationRole, isEntrepriseOrBureauDetudeRole, isRole, User } from 'camino-common/src/roles.js'
import { utilisateursFormatTable } from './format/utilisateurs.js'
import { tableConvert } from './_convert.js'
import { fileNameCreate } from '../../tools/file-name-create.js'
import { newsletterAbonnementValidator, QGISToken, utilisateurToEdit } from 'camino-common/src/utilisateur.js'
import { knex } from '../../knex.js'
import { idGenerate } from '../../database/models/_format/id-create.js'
import bcrypt from 'bcryptjs'
import { utilisateurUpdationValidate } from '../../business/validations/utilisateur-updation-validate.js'
import { canDeleteUtilisateur } from 'camino-common/src/permissions/utilisateurs.js'
import { DownloadFormat } from 'camino-common/src/rest.js'
import { Pool } from 'pg'

export const isSubscribedToNewsletter = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<boolean>) => {
  const user = req.auth

  if (!req.params.id) {
    res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
  } else {
    const utilisateur = await utilisateurGet(req.params.id, { fields: { id: {} } }, user)

    if (!user || !utilisateur) {
      res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
    } else {
      const subscribed = await isSubscribedToNewsLetter(utilisateur.email)
      res.json(subscribed)
    }
  }
}
export const updateUtilisateurPermission = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<void>) => {
  const user = req.auth

  if (!req.params.id) {
    res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
  } else {
    const utilisateurOld = await userGet(req.params.id)

    if (!user || !utilisateurOld) {
      res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
    } else {
      try {
        const utilisateur = utilisateurToEdit.parse(req.body)

        utilisateurUpdationValidate(user, utilisateur, utilisateurOld)

        // Thanks Objection
        if (!isAdministrationRole(utilisateur.role)) {
          utilisateur.administrationId = null
        }
        if (!isEntrepriseOrBureauDetudeRole(utilisateur.role)) {
          utilisateur.entreprises = []
        }

        // TODO 2023-03-13: le jour où les entreprises sont un tableau d'ids dans la table user, passer à knex
        await utilisateurUpsert({ ...utilisateur, entreprises: utilisateur.entreprises.map(id => ({ id })) })

        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT)
      } catch (e) {
        console.error(e)

        res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      }
    }
  }
}
export const deleteUtilisateur = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<void>) => {
  const user = req.auth

  if (!req.params.id) {
    res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
  } else {
    try {
      const utilisateur = await utilisateurGet(req.params.id, { fields: { id: {} } }, user)
      if (!utilisateur) {
        throw new Error('aucun utilisateur avec cet id ou droits insuffisants pour voir cet utilisateur')
      }

      if (!canDeleteUtilisateur(user, utilisateur.id)) {
        throw new Error('droits insuffisants')
      }

      utilisateur.email = null
      utilisateur.telephoneFixe = ''
      utilisateur.telephoneMobile = ''
      utilisateur.role = 'defaut'
      utilisateur.entreprises = []
      utilisateur.administrationId = undefined

      await utilisateurUpsert(utilisateur)

      res.sendStatus(constants.HTTP_STATUS_NO_CONTENT)
    } catch (e: any) {
      console.error(e)

      res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ error: e.message ?? `Une erreur s'est produite` })
    }
  }
}

export const moi = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<User>) => {
  res.clearCookie('shouldBeConnected')
  const user = req.auth
  if (!user) {
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT)
  } else {
    try {
      const utilisateur = await utilisateurGet(user.id, { fields: { entreprises: { id: {} } } }, user)
      res.cookie('shouldBeConnected', 'anyValueIsGood, We just check the presence of this cookie')
      // FIXME use zod validator !
      res.json(formatUser(utilisateur!))
    } catch (e) {
      console.error(e)
      res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST)
      throw e
    }
  }
}

export const manageNewsletterSubscription = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<boolean>) => {
  const user = req.auth

  if (!req.params.id) {
    res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
  } else {
    const utilisateur = await utilisateurGet(req.params.id, { fields: { id: {} } }, user)

    if (!user || !utilisateur) {
      res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
    } else {
      const subscriptionParsed = newsletterAbonnementValidator.safeParse(req.body)
      if (subscriptionParsed.success) {
        await newsletterSubscriberUpdate(utilisateur.email, subscriptionParsed.data.newsletter)
        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT)
      } else {
        res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST)
      }
    }
  }
}

export const generateQgisToken = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<QGISToken>) => {
  const user = req.auth

  if (!user) {
    res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
  } else {
    const token = idGenerate()
    await knex('utilisateurs')
      .update({ qgis_token: bcrypt.hashSync(token, 10) })
      .where('email', user.email)
    res.send({ token })
  }
}

interface IUtilisateursQueryInput {
  format?: DownloadFormat
  colonne?: IUtilisateursColonneId | null
  ordre?: 'asc' | 'desc' | null
  entrepriseIds?: string
  administrationIds?: string
  //  TODO 2022-06-14: utiliser un tableau de string plutôt qu'une chaine séparée par des ','
  roles?: string
  noms?: string | null
  emails?: string | null
}

export const utilisateurs = async ({ query: { format = 'json', colonne, ordre, entrepriseIds, administrationIds, roles, noms, emails } }: { query: IUtilisateursQueryInput }, user: User) => {
  const utilisateurs = await utilisateursGet(
    {
      colonne,
      ordre,
      entrepriseIds: entrepriseIds?.split(','),
      administrationIds: administrationIds?.split(','),
      roles: roles?.split(',').filter(isRole),
      noms,
      emails,
    },
    {},
    user
  )

  let contenu

  if (['csv', 'xlsx', 'ods'].includes(format)) {
    const elements = utilisateursFormatTable(utilisateurs)

    contenu = tableConvert('utilisateurs', elements, format)
  } else {
    contenu = JSON.stringify(utilisateurs, null, 2)
  }

  return contenu
    ? {
        nom: fileNameCreate(`utilisateurs-${utilisateurs.length}`, format),
        format,
        contenu,
      }
    : null
}
