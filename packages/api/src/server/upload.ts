import express from 'express'
import { Server, FileStore } from 'tus-node-server'
import { graphqlUploadExpress } from 'graphql-upload'
import { userByEmailGet } from '../database/queries/utilisateurs'
import { isDefault, UserNotNull } from 'camino-common/src/roles'
import { formatUser } from '../types'

interface IAuthRequestHttp extends express.Request {
  user?: {
    email?: string
  }
}

// Téléversement REST
const uploadAllowedMiddleware = async (
  req: IAuthRequestHttp,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    let user: UserNotNull | undefined
    if (req.user?.email) {
      const userInBdd = await userByEmailGet(req.user.email)
      if (userInBdd) {
        user = formatUser(userInBdd)
      }
    }

    if (isDefault(user)) {
      res.sendStatus(403)

      return
    }
    next()
  } catch (e: any) {
    res.status(500).send(e.message)
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
