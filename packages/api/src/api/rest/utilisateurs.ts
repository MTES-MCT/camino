import { userGet, utilisateurGet, utilisateursGet, utilisateurUpsert } from '../../database/queries/utilisateurs'
import { CaminoRequest, CustomResponse } from './express-type'
import { CaminoApiError, formatUser, IUtilisateursColonneId } from '../../types'
import { HTTP_STATUS } from 'camino-common/src/http'
import { isSubscribedToNewsLetter, newsletterSubscriberUpdate } from '../../tools/api-mailjet/newsletter'
import { isAdministrationRole, isEntrepriseOrBureauDetudeRole, isRole, User } from 'camino-common/src/roles'
import { utilisateursFormatTable } from './format/utilisateurs'
import { tableConvert } from './_convert'
import { fileNameCreate } from '../../tools/file-name-create'
import { newsletterAbonnementValidator, NewsletterRegistration, QGISToken, utilisateurToEdit } from 'camino-common/src/utilisateur'
import { knex } from '../../knex'
import { idGenerate } from '../../database/models/_format/id-create'
import bcrypt from 'bcryptjs'
import { utilisateurUpdationValidate } from '../../business/validations/utilisateur-updation-validate'
import { canDeleteUtilisateur } from 'camino-common/src/permissions/utilisateurs'
import { DownloadFormat } from 'camino-common/src/rest'
import { Pool } from 'pg'
import { DeepReadonly, isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { config } from '../../config/index'
import { Effect, Match, pipe } from 'effect'

export const isSubscribedToNewsletter =
  (_pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<boolean>): Promise<void> => {
    const user = req.auth

    if (!req.params.id) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      const utilisateur = await utilisateurGet(req.params.id, { fields: { id: {} } }, user)

      if (!user || !utilisateur) {
        res.sendStatus(HTTP_STATUS.FORBIDDEN)
      } else {
        const subscribed = await isSubscribedToNewsLetter(utilisateur.email)
        res.json(subscribed)
      }
    }
  }
export const updateUtilisateurPermission =
  (_pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<void>): Promise<void> => {
    const user = req.auth

    if (!req.params.id) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      const utilisateurOld = await userGet(req.params.id)

      if (!user || !utilisateurOld) {
        res.sendStatus(HTTP_STATUS.FORBIDDEN)
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

          res.sendStatus(HTTP_STATUS.NO_CONTENT)
        } catch (e) {
          console.error(e)

          res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        }
      }
    }
  }

export type KeycloakAccessTokenResponse = { access_token: string }

const getKeycloakApiToken = async (): Promise<string> => {
  const client_id = config().KEYCLOAK_API_CLIENT_ID
  const client_secret = config().KEYCLOAK_API_CLIENT_SECRET
  const url = config().KEYCLOAK_URL

  if (!client_id || !client_secret || !url) {
    throw new Error('variables KEYCLOAK_API_CLIENT_ID and KEYCLOAK_API_CLIENT_SECRET and KEYCLOAK_URL must be set')
  }

  const response = await fetch(`${url}/realms/Camino/protocol/openid-connect/token`, {
    method: 'POST',
    body: `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (response.ok) {
    const responseBody = (await response.json()) as KeycloakAccessTokenResponse

    const token = responseBody.access_token
    if (isNullOrUndefined(token)) {
      throw new Error('token vide')
    }

    return token
  } else {
    console.error('error', await response.text())
    throw new Error('Pas de token')
  }
}

export const deleteUtilisateur =
  (_pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<void>): Promise<void> => {
    const user = req.auth

    if (!req.params.id) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      try {
        const utilisateur = await utilisateurGet(req.params.id, { fields: { id: {} } }, user)
        if (!utilisateur) {
          throw new Error('aucun utilisateur avec cet id ou droits insuffisants pour voir cet utilisateur')
        }

        if (!canDeleteUtilisateur(user, utilisateur.id)) {
          throw new Error('droits insuffisants')
        }
        const utilisateurKeycloakId = utilisateur.keycloakId

        const authorizationToken = await getKeycloakApiToken()

        const deleteFromKeycloak = await fetch(`${config().KEYCLOAK_URL}/admin/realms/Camino/users/${utilisateurKeycloakId}`, {
          method: 'DELETE',
          headers: {
            authorization: `Bearer ${authorizationToken}`,
          },
        })
        if (!deleteFromKeycloak.ok) {
          throw new Error(`une erreur est apparue durant la suppression de l'utilisateur sur keycloak`)
        }

        utilisateur.email = null
        utilisateur.telephoneFixe = ''
        utilisateur.telephoneMobile = ''
        utilisateur.role = 'defaut'
        utilisateur.entreprises = []
        utilisateur.administrationId = undefined
        // TODO 2023-10-23 tout ce qui est au dessus n'est plus nécessaire une fois la migration des utilisateurs vers keycloak faite (suppression du champ email dans notre base)
        utilisateur.keycloakId = null

        await utilisateurUpsert(utilisateur)

        if (isNotNullNorUndefined(user) && user.id === req.params.id) {
          const uiUrl = config().OAUTH_URL
          const oauthLogoutUrl = new URL(`${uiUrl}/oauth2/sign_out`)
          res.redirect(oauthLogoutUrl.href)
        } else {
          res.sendStatus(HTTP_STATUS.NO_CONTENT)
        }
      } catch (e: any) {
        console.error(e)

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ error: e.message ?? `Une erreur s'est produite` })
      }
    }
  }

export const moi =
  (_pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<User>): Promise<void> => {
    res.clearCookie('shouldBeConnected')
    const user = req.auth
    if (!user) {
      res.sendStatus(HTTP_STATUS.NO_CONTENT)
    } else {
      try {
        const utilisateur = await utilisateurGet(user.id, { fields: { entreprises: { id: {} } } }, user)
        res.cookie('shouldBeConnected', 'anyValueIsGood, We just check the presence of this cookie')
        // TODO 2023-05-25 use zod validator!
        res.json(formatUser(utilisateur!))
      } catch (e) {
        console.error(e)
        res.sendStatus(HTTP_STATUS.BAD_REQUEST)
        throw e
      }
    }
  }

export const manageNewsletterSubscription =
  (_pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<boolean>): Promise<void> => {
    const user = req.auth

    if (!req.params.id) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      const utilisateur = await utilisateurGet(req.params.id, { fields: { id: {} } }, user)

      if (!user || !utilisateur) {
        res.sendStatus(HTTP_STATUS.FORBIDDEN)
      } else {
        const subscriptionParsed = newsletterAbonnementValidator.safeParse(req.body)
        if (subscriptionParsed.success) {
          await newsletterSubscriberUpdate(utilisateur.email, subscriptionParsed.data.newsletter)
          res.sendStatus(HTTP_STATUS.NO_CONTENT)
        } else {
          res.sendStatus(HTTP_STATUS.BAD_REQUEST)
        }
      }
    }
  }

export const generateQgisToken =
  (_pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<QGISToken>): Promise<void> => {
    const user = req.auth

    if (!user) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      const token = idGenerate()
      await knex('utilisateurs')
        .update({ qgis_token: bcrypt.hashSync(token, 10) })
        .where('email', user.email)
      res.send({ token, url: `https://${user.email.replace('@', '%40')}:${token}@${config().API_HOST}/titres_qgis` })
    }
  }

type NewsletterRegistrationErrors = "Impossible d'effectuer l'inscription à la newsletter"
export const registerToNewsletter = (pool: Pool, user: DeepReadonly<User>, body: DeepReadonly<NewsletterRegistration>): Effect.Effect<void, CaminoApiError<NewsletterRegistrationErrors>> => {
  return pipe(
    Effect.tryPromise({
      try: () => newsletterSubscriberUpdate(body.email, true),
      catch: unknown => ({ message: "Impossible d'effectuer l'inscription à la newsletter" as const, extra: unknown }),
    }),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.when("Impossible d'effectuer l'inscription à la newsletter", () => ({ ...caminoError, status: HTTP_STATUS.FORBIDDEN })),
        Match.exhaustive
      )
    )
  )
}

interface IUtilisateursQueryInput {
  format?: DownloadFormat
  colonne?: IUtilisateursColonneId | null
  ordre?: 'asc' | 'desc' | null
  entrepriseIds?: string | string[]
  administrationIds?: string | string[]
  //  TODO 2022-06-14: utiliser un tableau de string plutôt qu'une chaine séparée par des ','
  roles?: string | string[]
  noms?: string | null
  nomsUtilisateurs?: string | null
  emails?: string | null
}

export const utilisateurs =
  (_pool: Pool) =>
  async (
    { query: { format = 'csv', colonne, ordre, entrepriseIds, administrationIds, roles, noms, emails, nomsUtilisateurs } }: { query: IUtilisateursQueryInput },
    user: User
  ): Promise<{
    nom: string
    format: 'csv' | 'xlsx' | 'ods'
    contenu: string
  } | null> => {
    const utilisateurs = await utilisateursGet(
      {
        colonne,
        ordre,
        entreprisesIds: isNotNullNorUndefined(entrepriseIds) ? (Array.isArray(entrepriseIds) ? entrepriseIds : entrepriseIds.split(',')) : undefined,
        administrationIds: isNotNullNorUndefined(administrationIds) ? (Array.isArray(administrationIds) ? administrationIds : administrationIds.split(',')) : undefined,
        roles: isNotNullNorUndefined(roles) ? (Array.isArray(roles) ? roles.filter(isRole) : roles.split(',').filter(isRole)) : undefined,
        noms: noms ?? nomsUtilisateurs,
        emails,
      },
      {},
      user
    )

    let contenu

    switch (format) {
      case 'csv':
      case 'xlsx':
      case 'ods':
        contenu = tableConvert('utilisateurs', utilisateursFormatTable(utilisateurs), format)
        break
      default:
        throw new Error(`Format non supporté ${format}`)
    }

    return contenu
      ? {
          nom: fileNameCreate(`utilisateurs-${utilisateurs.length}`, format),
          format,
          contenu,
        }
      : null
  }
