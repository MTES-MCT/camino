import express from 'express'
import { CaminoRequest } from '../api/rest/express-type'

import { graphqlUploadExpress } from 'graphql-upload'
import { isDefault } from 'camino-common/src/roles.js'
import { Server, Upload } from '@tus/server'
import { FileStore } from '@tus/file-store'
import { IncomingMessage, ServerResponse } from 'node:http'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools.js'
import { fileUploadTypeValidator } from 'camino-common/src/static/documentsTypes.js'

// Téléversement REST
export const uploadAllowedMiddleware = async (req: CaminoRequest, res: express.Response, next: express.NextFunction) => {
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

const directory = './files/tmp'
const onUploadFinish = async (req: IncomingMessage, res: ServerResponse, upload: Upload): Promise<ServerResponse> => {
  const fileName = upload.metadata?.filename
  if (isNullOrUndefined(fileName)) {
    console.error('Le fichier uploadé est étrange', upload)
    // eslint-disable-next-line no-throw-literal
    throw { body: 'no', status_code: 500 }
  }

  const extension = fileName.split('.').at(-1)
  if (!fileUploadTypeValidator.safeParse(extension).success) {
    console.error("L'extension du fichier uploadé n'est pas autorisé", upload)
    // eslint-disable-next-line no-throw-literal
    throw { body: 'no', status_code: 500 }
  }

  return res
}

export const restUpload = () => {
  // nous passons à travers un proxy
  const relativeLocation = true
  const server = new Server({ path: '/televersement/files', respectForwardedHeaders: true, relativeLocation, datastore: new FileStore({ directory }), onUploadFinish })

  const uploadServer = express()
  uploadServer.disable('x-powered-by')

  uploadServer.all('*', server.handle.bind(server))

  return uploadServer
}

// Téléversement graphQL
export const graphqlUpload = graphqlUploadExpress({
  maxFileSize: Infinity,
  maxFiles: 10,
})
