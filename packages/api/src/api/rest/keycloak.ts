import express from 'express'
import { CustomResponse } from './express-type'

export const logout = async (
  req: express.Request,
  res: CustomResponse<string>
) => {
  const authorizationToken = req.header('authorization')
  if (!authorizationToken) {
    res.status(403)
  } else {
    const token = authorizationToken.substring(7)
    const uiUrl = process.env.OAUTH_URL ?? 'https://camino.beta.gouv.fr'

    const keycloakLogoutUrl = new URL(
      `${
        process.env.KEYCLOAK_URL ?? 'https://login.camino.beta.gouv.fr'
      }/realms/camino/protocol/openid-connect/logout`
    )
    keycloakLogoutUrl.searchParams.append('post_logout_redirect_uri', uiUrl)
    keycloakLogoutUrl.searchParams.append('id_token_hint', token)

    const oauthLogoutUrl = new URL(`${uiUrl}/oauth2/sign_out`)
    oauthLogoutUrl.searchParams.append('rd', keycloakLogoutUrl.href)

    res.redirect(oauthLogoutUrl.href)
  }
}
export const resetPassword = async (
  req: express.Request,
  res: CustomResponse<string>
) => {
  const uiUrl = process.env.OAUTH_URL ?? 'https://camino.beta.gouv.fr'

  const resetPasswordUrl = new URL(
    `${
      process.env.KEYCLOAK_URL ?? 'https://login.camino.beta.gouv.fr'
    }/realms/camino/protocol/openid-connect/auth`
  )
  resetPasswordUrl.searchParams.append('response_type', 'code')
  resetPasswordUrl.searchParams.append('client_id', 'camino-web')
  resetPasswordUrl.searchParams.append('kc_action', 'UPDATE_PASSWORD')
  resetPasswordUrl.searchParams.append('redirect_uri', uiUrl)

  res.redirect(resetPasswordUrl.href)
}
