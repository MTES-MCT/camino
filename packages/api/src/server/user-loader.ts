import express from 'express'
import { Request as JWTRequest } from 'express-jwt'
import { knex } from '../knex'
import { utilisateurCreate } from '../database/queries/utilisateurs'
import { emailsSend, emailsWithTemplateSend } from '../tools/api-mailjet/emails'
import { formatUser } from '../types'
import { getCurrent } from 'camino-common/src/date'
import { EmailTemplateId } from '../tools/api-mailjet/types'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { config } from '../config/index'
import { Pool } from 'pg'
import { getUtilisateurById, getUtilisateurByKeycloakId } from '../database/queries/utilisateurs.queries'
import { UtilisateurId } from 'camino-common/src/roles'
import { newUtilisateurId } from '../database/models/_format/id-create'
import { userSuper } from '../database/user-super'

export type JWTUser = { email?: string; family_name?: string; given_name?: string; sub: string | undefined }

const userIdGenerate = async (pool: Pool): Promise<UtilisateurId> => {
  const id = newUtilisateurId()
  const utilisateurWithTheSameId = await getUtilisateurById(pool, id, userSuper)
  if (isNotNullNorUndefined(utilisateurWithTheSameId)) {
    return userIdGenerate(pool)
  }

  return id
}

export const userLoader =
  (pool: Pool) =>
  async (req: JWTRequest<{ email?: string; family_name?: string; given_name?: string; sub?: string }>, _res: express.Response, next: express.NextFunction): Promise<void> => {
    try {
      const reqUser: JWTUser | undefined = req.auth as JWTUser
      if (isNotNullNorUndefined(reqUser) && isNotNullNorUndefinedNorEmpty(reqUser.sub)) {
        const user = await getUtilisateurByKeycloakId(pool, reqUser.sub)
        if (isNullOrUndefined(user)) {
          if (isNullOrUndefined(reqUser.family_name) || isNullOrUndefined(reqUser.given_name)) {
            next(new Error('utilisateur inconnu'))

            return
          }

          // si c’est la première fois que l’utilisateur se connecte, on utilise les infos du jeton pour le créer dans Camino
          const newUser = await utilisateurCreate(
            {
              id: await userIdGenerate(pool),
              email: reqUser.email,
              role: 'defaut',
              nom: reqUser.family_name,
              prenom: reqUser.given_name,
              dateCreation: getCurrent(),
              keycloakId: reqUser.sub,
            },
            { fields: { entreprises: { id: {} } } }
          )

          if (isNullOrUndefined(newUser)) {
            next(new Error('impossible de créer le nouvel utilisateur'))

            return
          }

          await emailsSend(
            [config().ADMIN_EMAIL],
            `Nouvel utilisateur ${newUser.email} créé`,
            `L'utilisateur ${newUser.nom} ${newUser.prenom} vient de se créer un compte : ${config().OAUTH_URL}/utilisateurs/${newUser.id}`
          )
          if (isNotNullNorUndefined(reqUser.email)) {
            await emailsWithTemplateSend([reqUser.email], EmailTemplateId.CREATION_COMPTE, {})
          }

          req.auth = formatUser(newUser)

          return
        } else if (user.nom !== reqUser.family_name || user.prenom !== reqUser.given_name || user.email !== reqUser.email) {
          const newNom = reqUser.family_name ?? user.nom
          const newPrenom = reqUser.given_name ?? user.prenom ?? ''
          const newEmail = reqUser.email ?? user.email

          // mise à jour du nom et du prénom de l’utilisateur
          await knex('utilisateurs').update({ nom: newNom, prenom: newPrenom, email: newEmail }).where('id', user.id)
          user.nom = newNom
          user.prenom = newPrenom
          user.email = newEmail
        }

        req.auth = formatUser(user)
      }

      next()
    } catch (e) {
      console.error(e)

      next(e)
    }
  }
