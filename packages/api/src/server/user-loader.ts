import express from 'express'
import { Request as JWTRequest } from 'express-jwt'
import { knex } from '../knex'
import { userIdGenerate } from '../api/graphql/resolvers/utilisateurs'
import { userByKeycloakIdGet, utilisateurCreate } from '../database/queries/utilisateurs'
import { emailsSend, emailsWithTemplateSend } from '../tools/api-mailjet/emails'
import { formatUser } from '../types'
import { getCurrent } from 'camino-common/src/date'
import { EmailTemplateId } from '../tools/api-mailjet/types'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { config } from '../config/index'

export type JWTUser = { email?: string; family_name?: string; given_name?: string; sub: string | undefined }
export const userLoader = async (req: JWTRequest<{ email?: string; family_name?: string; given_name?: string; sub?: string }>, _res: express.Response, next: express.NextFunction) => {
  try {
    const reqUser: JWTUser | undefined = req.auth as JWTUser
    if (isNotNullNorUndefined(reqUser)) {
      let user = await userByKeycloakIdGet(reqUser.sub)
      if (!user) {
        if (isNullOrUndefined(reqUser.family_name) || isNullOrUndefined(reqUser.given_name)) {
          next(new Error('utilisateur inconnu'))

          return
        }

        // si c’est la première fois que l’utilisateur se connecte, on utilise les infos du jeton pour le créer dans Camino
        user = await utilisateurCreate(
          {
            id: await userIdGenerate(),
            email: reqUser.email,
            role: 'defaut',
            nom: reqUser.family_name,
            prenom: reqUser.given_name,
            dateCreation: getCurrent(),
            keycloakId: reqUser.sub,
          },
          { fields: { entreprises: { id: {} } } }
        )

        await emailsSend(
          [config().ADMIN_EMAIL],
          `Nouvel utilisateur ${user.email} créé`,
          `L'utilisateur ${user.nom} ${user.prenom} vient de se créer un compte : ${config().OAUTH_URL}/utilisateurs/${user.id}`
        )
        if (isNotNullNorUndefined(reqUser.email)) {
          await emailsWithTemplateSend([reqUser.email], EmailTemplateId.CREATION_COMPTE, {})
        }
      } else if (user.nom !== reqUser.family_name || user.prenom !== reqUser.given_name || user.email !== reqUser.email) {
        // mise à jour du nom et du prénom de l’utilisateur
        await knex('utilisateurs').update({ nom: reqUser.family_name, prenom: reqUser.given_name, email: reqUser.email }).where('id', user.id)
        user.nom = reqUser.family_name
        user.prenom = reqUser.given_name
        user.email = reqUser.email
      }

      req.auth = formatUser(user)
    }

    next()
  } catch (e) {
    console.error(e)

    next(e)
  }
}
