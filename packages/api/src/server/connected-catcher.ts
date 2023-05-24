import express from 'express'
import { constants } from 'http2'
import { CaminoRestRoute } from 'camino-common/src/rest.js'
import { CaminoRequest } from '../api/rest/express-type'

export const connectedCatcher = async (req: CaminoRequest, res: express.Response, next: express.NextFunction) => {
  const excludedRoutes: CaminoRestRoute[] = ['/moi', '/config']
  if (excludedRoutes.every(route => !req.url.includes(route))) {
    if (req.cookies.shouldBeConnected) {
      const reqUser = req.auth
      if (!reqUser) {
        console.info('forbid a user that should be connected but is not')
        res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)

        return
      }
    }
  }
  next()
}
