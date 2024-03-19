import { expressjwt } from 'express-jwt'
import { CaminoRequest } from '../api/rest/express-type'
import { config } from '../config/index.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

export const authJwt = expressjwt({
  credentialsRequired: false,
  getToken: (req: CaminoRequest) => {
    if (isNotNullNorUndefined(req.headers)) {
      const token = req.headers['x-forwarded-access-token']
      if (isNotNullNorUndefined(token)) {
        return Array.isArray(token) ? token[0] : token
      }
    }

    return undefined
  },
  secret: config().JWT_SECRET,
  algorithms: [config().JWT_SECRET_ALGORITHM],
})
