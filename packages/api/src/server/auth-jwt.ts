import { Algorithm } from 'jsonwebtoken'
import { expressjwt } from 'express-jwt'
import { CaminoRequest } from '../api/rest/express-type'

export const authJwt = expressjwt({
  credentialsRequired: false,
  getToken: (req: CaminoRequest) => {
    if (req.headers) {
      const token = req.headers['x-forwarded-access-token']
      if (token) {
        return Array.isArray(token) ? token[0] : token
      }
    }

    return undefined
  },
  secret: process.env.JWT_SECRET || 'jwtSecret should be declared in .env',
  // TODO 2023-03-15: vérifier ça au runtime ?
  algorithms: [(process.env.JWT_SECRET_ALGORITHM as Algorithm) || 'HS256'],
})
