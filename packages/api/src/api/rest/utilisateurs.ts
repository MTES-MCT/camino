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
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools.js'

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

export type KeycloakAccessTokenResponse = { access_token: string }

export const getKeycloakApiToken = async (): Promise<string> => {
  const client_id = process.env.KEYCLOAK_API_CLIENT_ID
  const client_secret = process.env.KEYCLOAK_API_CLIENT_SECRET
  const url = process.env.KEYCLOAK_URL

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
      const utilisateurKeycloakId = utilisateur.keycloakId

      const authorizationToken = await getKeycloakApiToken()

      const deleteFromKeycloak = await fetch(`${process.env.KEYCLOAK_URL}/admin/realms/Camino/users/${utilisateurKeycloakId}`, {
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
        const uiUrl = process.env.OAUTH_URL
        const oauthLogoutUrl = new URL(`${uiUrl}/oauth2/sign_out`)
        res.redirect(oauthLogoutUrl.href)
      } else {
        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT)
      }
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
      // TODO 2023-05-25 use zod validator!
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
    res.send({ token, url: `https://${user.email.replace('@', '%40')}:${token}@${process.env.API_HOST ?? 'api.camino.beta.gouv.fr'}/titres_qgis` })
  }
}

interface IUtilisateursQueryInput {
  format?: DownloadFormat
  colonne?: IUtilisateursColonneId | null
  ordre?: 'asc' | 'desc' | null
  entrepriseIds?: string | string[]
  administrationIds?: string
  //  TODO 2022-06-14: utiliser un tableau de string plutôt qu'une chaine séparée par des ','
  roles?: string
  noms?: string | null
  nomsUtilisateurs?: string | null
  emails?: string | null
}

export const utilisateurs =
  (_pool: Pool) =>
  async ({ query: { format = 'csv', colonne, ordre, entrepriseIds, administrationIds, roles, noms, emails, nomsUtilisateurs } }: { query: IUtilisateursQueryInput }, user: User) => {
    const utilisateurs = await utilisateursGet(
      {
        colonne,
        ordre,
        entreprisesIds: entrepriseIds ? (Array.isArray(entrepriseIds) ? entrepriseIds : entrepriseIds.split(',')) : undefined,
        administrationIds: administrationIds ? (Array.isArray(administrationIds) ? administrationIds : administrationIds.split(',')) : undefined,
        roles: roles ? (Array.isArray(roles) ? roles.filter(isRole) : roles.split(',').filter(isRole)) : undefined,
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
