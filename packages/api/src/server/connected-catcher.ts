import express from 'express'
import { CaminoRestRoute } from 'camino-common/src/rest'
import { CaminoRequest } from '../api/rest/express-type'
import { HTTP_STATUS } from 'camino-common/src/http'

const excludedRoutes: CaminoRestRoute[] = ['/moi', '/config']
export const connectedCatcher = async (req: CaminoRequest, res: express.Response, next: express.NextFunction) => {
  if (excludedRoutes.every(route => !req.url.includes(route))) {
    if ('shouldBeConnected' in req.cookies) {
      const reqUser = req.auth
      if (!reqUser) {
        console.info('forbid a user that should be connected but is not')
        res.sendStatus(HTTP_STATUS.UNAUTHORIZED)

        return
      }
    }
  }
  next()
}
