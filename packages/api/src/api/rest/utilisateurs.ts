import {
  userGet,
  utilisateurGet,
  utilisateursGet
} from '../../database/queries/utilisateurs'
import express from 'express'
import { CustomResponse } from './express-type'
import { IFormat, IUser, IUtilisateursColonneId } from '../../types'
import { constants } from 'http2'
import {
  isSubscribedToNewsLetter,
  newsletterSubscriberUpdate
} from '../../tools/api-mailjet/newsletter'
import { isRole } from 'camino-common/src/roles'
import { utilisateursFormatTable } from './format/utilisateurs'
import { tableConvert } from './_convert'
import { fileNameCreate } from '../../tools/file-name-create'

export const isSubscribedToNewsletter = async (
  req: express.Request<{ id?: string }>,
  res: CustomResponse<boolean>
) => {
  const userId = (req.user as unknown as IUser | undefined)?.id
  const user = await userGet(userId)

  if (!req.params.id) {
    res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
  } else {
    const utilisateur = await utilisateurGet(
      req.params.id,
      { fields: { id: {} } },
      user
    )

    if (!user || !utilisateur) {
      res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
    } else {
      const subscribed = await isSubscribedToNewsLetter(utilisateur.email)
      res.json(subscribed)
    }
  }
}

export const manageNewsletterSubscription = async (
  req: express.Request<{ id?: string }>,
  res: CustomResponse<boolean>
) => {
  const userId = (req.user as unknown as IUser | undefined)?.id
  const user = await userGet(userId)

  if (!req.params.id) {
    res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
  } else {
    const utilisateur = await utilisateurGet(
      req.params.id,
      { fields: { id: {} } },
      user
    )

    if (!user || !utilisateur) {
      res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
    } else {
      const subscription = req.body

      if (
        typeof subscription !== 'object' &&
        !('newsletter' in subscription) &&
        typeof subscription.newsletter !== 'boolean'
      ) {
        res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST)
      } else {
        await newsletterSubscriberUpdate(
          utilisateur.email,
          subscription.newsletter
        )
        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT)
      }
    }
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

export const utilisateurs = async (
  {
    query: {
      format = 'json',
      colonne,
      ordre,
      entrepriseIds,
      administrationIds,
      roles,
      noms,
      emails
    }
  }: { query: IUtilisateursQueryInput },
  userId?: string
) => {
  const user = await userGet(userId)

  const utilisateurs = await utilisateursGet(
    {
      colonne,
      ordre,
      entrepriseIds: entrepriseIds?.split(','),
      administrationIds: administrationIds?.split(','),
      roles: roles?.split(',').filter(isRole) ?? [],
      noms,
      emails
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
        contenu
      }
    : null
}
