import express from 'express'
import { Server, FileStore } from 'tus-node-server'
import { graphqlUploadExpress } from 'graphql-upload'
import { permissionCheck } from '../business/permission'
import { userGet } from '../database/queries/utilisateurs'
import { constants } from 'http2'
import { isAuthRequest } from './auth-jwt'

// Téléversement REST
const uploadAllowedMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!isAuthRequest(req)) {
    res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
  } else {
    const userId = req.auth.id

    const user = await userGet(userId)

    if (!user || permissionCheck(user.permissionId, ['defaut'])) {
      res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)

      return
    }
    next()
  }
}

const restUpload = () => {
  const tmp = '/files/tmp'
  const server = new Server()

  // nous passons à travers un proxy
  const relativeLocation = true
  server.datastore = new FileStore({ path: tmp, relativeLocation })

  const uploadServer = express()
  uploadServer.all('*', server.handle.bind(server))

  return uploadServer
}

// Téléversement graphQL
const graphqlUpload = graphqlUploadExpress({
  maxFileSize: Infinity,
  maxFiles: 10
})

export { restUpload, uploadAllowedMiddleware, graphqlUpload }
