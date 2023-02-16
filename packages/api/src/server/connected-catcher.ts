import express from 'express'
import { User } from 'camino-common/src/roles.js'
import { constants } from 'http2'

export const connectedCatcher = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // SI /moi --> on fait rien
  // SI pas /moi --> 
  //    SI cookie shouldBeConnected == true et pas de user chargé --> redirection sur le login keycloak
  if (!req.url.includes('/moi') && !req.url.includes('/config')) {
    if (req.cookies['shouldBeConnected']) {
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
