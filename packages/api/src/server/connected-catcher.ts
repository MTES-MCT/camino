import express from 'express'
import { User } from 'camino-common/src/roles.js'
import { constants } from 'http2'
import { CaminoRestRoutes } from 'camino-common/src/rest.js'

export const connectedCatcher = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.url.includes(CaminoRestRoutes.moi) && !req.url.includes(CaminoRestRoutes.config)) {
    if (req.cookies.shouldBeConnected) {
      const reqUser = req.user as User
      if (!reqUser) {
        console.info('forbid a user that should be connected but is not')
        res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)

        return
      }
    }
  }
  next()
}
