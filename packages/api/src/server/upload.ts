import express from 'express'
import { Request } from 'express-jwt'

import { Server, FileStore } from 'tus-node-server'
import { graphqlUploadExpress } from 'graphql-upload'
import { isDefault, User } from 'camino-common/src/roles.js'

// Téléversement REST
const uploadAllowedMiddleware = async (req: Request<User>, res: express.Response, next: express.NextFunction) => {
  try {
    if (isDefault(req.auth)) {
      res.sendStatus(403)

      return
    }
    next()
  } catch (e: any) {
    res.status(500).send(e.message)
  }
}

const restUpload = () => {
  // nous passons à travers un proxy
  const relativeLocation = true
  const server = new Server({ path: '/files', relativeLocation })
  server.datastore = new FileStore({ directory: './files/tmp' })

  const uploadServer = express()
  uploadServer.disable('x-powered-by')

  uploadServer.all('*', server.handle.bind(server))

  return uploadServer
}

// Téléversement graphQL
const graphqlUpload = graphqlUploadExpress({
  maxFileSize: Infinity,
  maxFiles: 10,
})

export { restUpload, uploadAllowedMiddleware, graphqlUpload }
