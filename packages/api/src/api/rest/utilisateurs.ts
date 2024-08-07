import { userGet, utilisateurGet, utilisateurUpsert } from '../../database/queries/utilisateurs'
import { CaminoRequest, CustomResponse } from './express-type'
import { CaminoApiError, formatUser } from '../../types'
import { HTTP_STATUS } from 'camino-common/src/http'
import { isSubscribedToNewsLetter, newsletterSubscriberUpdate } from '../../tools/api-mailjet/newsletter'
import { isAdministrationRole, isEntrepriseOrBureauDetudeRole, User } from 'camino-common/src/roles'
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
import { getUtilisateursFilteredAndSorted } from '../../database/queries/utilisateurs.queries'
import { DbQueryAccessError } from '../../pg-database'
import { callAndExit, ZodUnparseable } from '../../tools/fp-tools'
import { z } from 'zod'

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

export const registerToNewsletter: RestNewGetCall<'/rest/utilisateurs/registerToNewsletter'> = (
  _pool: Pool,
  _user: DeepReadonly<User>,
  _params: Record<string, never>,
  searchParams: { email: string }
): Effect.Effect<boolean, CaminoApiError<"Impossible de s'enregistrer à la newsletter">> => {
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
      const contenu = tableConvert('utilisateurs', utilisateursFormatTable(utilisateurs), format)

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
export const getUtilisateurs: RestNewGetCall<'/rest/utilisateurs'> = (pool, user, _params, searchParams): Effect.Effect<DeepReadonly<UtilisateursTable>, CaminoApiError<GetUtilisateursError>> => {
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
