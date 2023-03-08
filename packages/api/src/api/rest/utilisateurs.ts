import { utilisateurGet, utilisateursGet } from '../../database/queries/utilisateurs.js'
import express from 'express'
import { CustomResponse } from './express-type.js'
import { formatUser, IFormat, IUtilisateursColonneId } from '../../types.js'
import { constants } from 'http2'
import { isSubscribedToNewsLetter, newsletterSubscriberUpdate } from '../../tools/api-mailjet/newsletter.js'
import { isRole, User } from 'camino-common/src/roles.js'
import { utilisateursFormatTable } from './format/utilisateurs.js'
import { tableConvert } from './_convert.js'
import { fileNameCreate } from '../../tools/file-name-create.js'
import { QGISToken } from 'camino-common/src/utilisateur.js'
import { knex } from '../../knex.js'
import { idGenerate } from '../../database/models/_format/id-create.js'
import bcrypt from 'bcryptjs'

export const isSubscribedToNewsletter = async (req: express.Request<{ id?: string }>, res: CustomResponse<boolean>) => {
  const user = req.user as User

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

export const moi = async (req: express.Request<{ id?: string }>, res: CustomResponse<User>) => {
  res.clearCookie('shouldBeConnected')
  const user = req.user as User
  if (!user) {
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT)
  } else {
    try {
      const utilisateur = await utilisateurGet(user.id, { fields: { entreprises: { id: {} } } }, user)
      res.cookie('shouldBeConnected', 'anyValueIsGood, We just check the presence of this cookie')
      res.json(formatUser(utilisateur!))
    } catch (e) {
      console.error(e)
      res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST)
      throw e
    }
  }
}

export const manageNewsletterSubscription = async (req: express.Request<{ id?: string }>, res: CustomResponse<boolean>) => {
  const user = req.user as User

  if (!req.params.id) {
    res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
  } else {
    const utilisateur = await utilisateurGet(req.params.id, { fields: { id: {} } }, user)

    if (!user || !utilisateur) {
      res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
    } else {
      const subscription = req.body

      if (typeof subscription !== 'object' && !('newsletter' in subscription) && typeof subscription.newsletter !== 'boolean') {
        res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST)
      } else {
        await newsletterSubscriberUpdate(utilisateur.email, subscription.newsletter)
        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT)
      }
    }
  }
}

export const generateQgisToken = async (req: express.Request, res: CustomResponse<QGISToken>) => {
  const user = req.user as User

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
  format?: IFormat
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
