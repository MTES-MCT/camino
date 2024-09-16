import { CaminoRequest, CustomResponse } from './express-type'
import { CaminoApiError } from '../../types'
import { HTTP_STATUS } from 'camino-common/src/http'
import { isSubscribedToNewsLetter, newsletterSubscriberUpdate } from '../../tools/api-mailjet/newsletter'
import { User, UserNotNull, utilisateurIdValidator } from 'camino-common/src/roles'
import { utilisateursFormatTable } from './format/utilisateurs'
import { tableConvert } from './_convert'
import { fileNameCreate } from '../../tools/file-name-create'
import { newsletterAbonnementValidator, QGISToken, utilisateursSearchParamsValidator, UtilisateursTable, utilisateurToEdit } from 'camino-common/src/utilisateur'
import { knex } from '../../knex'
import { idGenerate } from '../../database/models/_format/id-create'
import bcrypt from 'bcryptjs'
import { utilisateurUpdationValidate } from '../../business/validations/utilisateur-updation-validate'
import { canDeleteUtilisateur } from 'camino-common/src/permissions/utilisateurs'
import { Pool } from 'pg'
import { DeepReadonly, isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { config } from '../../config/index'
import { Effect, Match, pipe } from 'effect'
import { RestNewGetCall } from '../../server/rest'
import {
  getKeycloakIdByUserId,
  getUtilisateurById,
  getUtilisateursFilteredAndSorted,
  newGetUtilisateurById,
  softDeleteUtilisateur,
  updateUtilisateurRole,
} from '../../database/queries/utilisateurs.queries'
import { DbQueryAccessError } from '../../pg-database'
import { callAndExit, ZodUnparseable } from '../../tools/fp-tools'
import { z } from 'zod'
import { getEntreprises } from './entreprises.queries'

export const isSubscribedToNewsletter =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<boolean>): Promise<void> => {
    const user = req.auth

    if (!req.params.id) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      const utilisateur = await getUtilisateurById(pool, utilisateurIdValidator.parse(req.params.id), user)

      if (!user || !utilisateur) {
        res.sendStatus(HTTP_STATUS.FORBIDDEN)
      } else {
        const subscribed = await isSubscribedToNewsLetter(utilisateur.email)
        res.json(subscribed)
      }
    }
  }
export const updateUtilisateurPermission =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<void>): Promise<void> => {
    const user = req.auth

    if (!req.params.id) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      const userId = utilisateurIdValidator.parse(req.params.id)
      const utilisateurOld = await getUtilisateurById(pool, userId, user)

      if (!user || !utilisateurOld) {
        res.sendStatus(HTTP_STATUS.FORBIDDEN)
      } else {
        try {
          const utilisateur = utilisateurToEdit.parse(req.body)

          utilisateurUpdationValidate(user, utilisateur, utilisateurOld)

          await updateUtilisateurRole(pool, utilisateur)

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
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<void>): Promise<void> => {
    const user = req.auth

    if (!req.params.id) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      try {
        const utilisateurId = utilisateurIdValidator.parse(req.params.id)

        if (!canDeleteUtilisateur(user, utilisateurId)) {
          throw new Error('droits insuffisants')
        }

        const utilisateurKeycloakId = await getKeycloakIdByUserId(pool, utilisateurId)
        if (isNullOrUndefined(utilisateurKeycloakId)) {
          throw new Error('aucun utilisateur avec cet id ou droits insuffisants pour voir cet utilisateur')
        }

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

        await softDeleteUtilisateur(pool, utilisateurId)

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
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<User>): Promise<void> => {
    res.clearCookie('shouldBeConnected')
    const user = req.auth
    if (!user) {
      res.sendStatus(HTTP_STATUS.NO_CONTENT)
    } else {
      try {
        const utilisateur = await getUtilisateurById(pool, user.id, user)
        res.cookie('shouldBeConnected', 'anyValueIsGood, We just check the presence of this cookie')
        res.json(utilisateur)
      } catch (e) {
        console.error(e)
        res.sendStatus(HTTP_STATUS.BAD_REQUEST)
        throw e
      }
    }
  }

export const manageNewsletterSubscription =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<boolean>): Promise<void> => {
    const user = req.auth

    if (!req.params.id) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      const utilisateur = await getUtilisateurById(pool, utilisateurIdValidator.parse(req.params.id), user)

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

export const registerToNewsletter: RestNewGetCall<'/rest/utilisateurs/registerToNewsletter'> = ({
  searchParams,
}): Effect.Effect<boolean, CaminoApiError<"Impossible de s'enregistrer à la newsletter">> => {
  return pipe(
    Effect.tryPromise({
      try: async () => {
        await newsletterSubscriberUpdate(searchParams.email, true)

        return true
      },
      catch: e => {
        let extra = ''
        if (typeof e === 'string') {
          extra = e.toUpperCase()
        } else if (e instanceof Error) {
          extra = e.message
        }

        return { message: "Impossible de s'enregistrer à la newsletter" as const, extra }
      },
    }),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.when("Impossible de s'enregistrer à la newsletter", () => ({ ...caminoError, status: HTTP_STATUS.INTERNAL_SERVER_ERROR })),
        Match.exhaustive
      )
    )
  )
}

export const utilisateurs =
  (pool: Pool) =>
  async (
    { query }: { query: unknown },
    user: User
  ): Promise<{
    nom: string
    format: 'csv' | 'xlsx' | 'ods'
    contenu: string
  } | null> => {
    const searchParams = utilisateursSearchParamsValidator.and(z.object({ format: z.enum(['csv', 'xlsx', 'ods']).optional().default('csv') })).parse(query)

    return callAndExit(getUtilisateursFilteredAndSorted(pool, user, searchParams), async utilisateurs => {
      const format = searchParams.format

      const entreprises = await getEntreprises(pool)
      const contenu = tableConvert('utilisateurs', utilisateursFormatTable(utilisateurs, entreprises), format)

      return contenu
        ? {
            nom: fileNameCreate(`utilisateurs-${utilisateurs.length}`, format),
            format,
            contenu,
          }
        : null
    })
  }

type GetUtilisateursError = DbQueryAccessError | ZodUnparseable | "Impossible d'accéder à la liste des utilisateurs" | 'droits insuffisants'

export const getUtilisateurs: RestNewGetCall<'/rest/utilisateurs'> = ({ pool, user, searchParams }): Effect.Effect<DeepReadonly<UtilisateursTable>, CaminoApiError<GetUtilisateursError>> => {
  return Effect.Do.pipe(
    Effect.flatMap(() => getUtilisateursFilteredAndSorted(pool, user, searchParams)),
    Effect.map(utilisateurs => {
      return {
        elements: utilisateurs.slice((searchParams.page - 1) * searchParams.intervalle, searchParams.page * searchParams.intervalle),
        total: utilisateurs.length,
      }
    }),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.when("Impossible d'accéder à la base de données", () => ({ ...caminoError, status: HTTP_STATUS.INTERNAL_SERVER_ERROR })),
        Match.when('droits insuffisants', () => ({ ...caminoError, status: HTTP_STATUS.FORBIDDEN })),
        Match.when('Problème de validation de données', () => ({ ...caminoError, status: HTTP_STATUS.BAD_REQUEST })),
        Match.exhaustive
      )
    )
  )
}

type GetUtilisateurError = DbQueryAccessError | ZodUnparseable | 'droits insuffisants'
export const getUtilisateur: RestNewGetCall<'/rest/utilisateurs/:id'> = ({ pool, user, params }): Effect.Effect<DeepReadonly<UserNotNull>, CaminoApiError<GetUtilisateurError>> => {
  return Effect.Do.pipe(
    Effect.flatMap(() => newGetUtilisateurById(pool, params.id, user)),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.when("Impossible d'accéder à la base de données", () => ({ ...caminoError, status: HTTP_STATUS.INTERNAL_SERVER_ERROR })),
        Match.when('droits insuffisants', () => ({ ...caminoError, status: HTTP_STATUS.FORBIDDEN })),
        Match.when('Problème de validation de données', () => ({ ...caminoError, status: HTTP_STATUS.BAD_REQUEST })),
        Match.exhaustive
      )
    )
  )
}
