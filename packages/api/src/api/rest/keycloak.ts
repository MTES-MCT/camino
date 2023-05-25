import { Pool } from 'pg'
import { CaminoRequest, CustomResponse } from './express-type'

export const logout = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<string>) => {
  const authorizationToken = req.header('authorization')
  if (!authorizationToken) {
    res.sendStatus(403)
  } else {
    const token = authorizationToken.substring(7)
    const uiUrl = process.env.OAUTH_URL ?? ''

    const keycloakLogoutUrl = new URL(process.env.KEYCLOAK_LOGOUT_URL ?? '')
    keycloakLogoutUrl.searchParams.append('post_logout_redirect_uri', uiUrl)
    keycloakLogoutUrl.searchParams.append('id_token_hint', token)

    const oauthLogoutUrl = new URL(`${uiUrl}/oauth2/sign_out`)
    oauthLogoutUrl.searchParams.append('rd', keycloakLogoutUrl.href)

    res.redirect(oauthLogoutUrl.href)
  }
}
export const resetPassword = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<string>) => {
  const authorizationToken = req.header('authorization')
  if (!authorizationToken) {
    res.sendStatus(403)
  } else {
    const uiUrl = process.env.OAUTH_URL ?? ''

    const resetPasswordUrl = new URL(process.env.KEYCLOAK_RESET_PASSWORD_URL ?? '')
    resetPasswordUrl.searchParams.append('response_type', 'code')
    resetPasswordUrl.searchParams.append('client_id', process.env.KEYCLOAK_CLIENT_ID ?? '')
    resetPasswordUrl.searchParams.append('kc_action', 'UPDATE_PASSWORD')
    resetPasswordUrl.searchParams.append('redirect_uri', uiUrl)

    res.redirect(resetPasswordUrl.href)
  }
}
