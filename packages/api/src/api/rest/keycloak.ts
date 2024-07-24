import { Pool } from 'pg'
import { CaminoRequest, CustomResponse } from './express-type'
import { config } from '../../config/index'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'

export const logout = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<string>) => {
  const authorizationToken = req.header('authorization')
  if (isNullOrUndefined(authorizationToken)) {
    res.sendStatus(403)
  } else {
    const token = authorizationToken.substring(7)
    const uiUrl = config().OAUTH_URL

    const keycloakLogoutUrl = new URL(config().KEYCLOAK_LOGOUT_URL)
    keycloakLogoutUrl.searchParams.append('post_logout_redirect_uri', uiUrl)
    keycloakLogoutUrl.searchParams.append('id_token_hint', token)

    const oauthLogoutUrl = new URL(`${uiUrl}/oauth2/sign_out`)
    oauthLogoutUrl.searchParams.append('rd', keycloakLogoutUrl.href)
    res.clearCookie('shouldBeConnected')
    res.redirect(oauthLogoutUrl.href)
  }
}
export const resetPassword = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<string>) => {
  const authorizationToken = req.header('authorization')
  if (isNullOrUndefined(authorizationToken)) {
    res.sendStatus(403)
  } else {
    const uiUrl = config().OAUTH_URL

    const resetPasswordUrl = new URL(config().KEYCLOAK_RESET_PASSWORD_URL)
    resetPasswordUrl.searchParams.append('response_type', 'code')
    resetPasswordUrl.searchParams.append('client_id', config().KEYCLOAK_CLIENT_ID)
    resetPasswordUrl.searchParams.append('kc_action', 'UPDATE_PASSWORD')
    resetPasswordUrl.searchParams.append('redirect_uri', uiUrl)

    res.redirect(resetPasswordUrl.href)
  }
}
