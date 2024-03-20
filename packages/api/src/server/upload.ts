import express from 'express'
import { CaminoRequest } from '../api/rest/express-type'

import { graphqlUploadExpress } from 'graphql-upload'
import { isDefault } from 'camino-common/src/roles.js'
import { Server, Upload } from '@tus/server'
import { FileStore } from '@tus/file-store'
import { IncomingMessage, ServerResponse } from 'node:http'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools.js'
import { fileUploadTypeValidator } from 'camino-common/src/static/documentsTypes.js'
import { isPdf } from '../tools/file-check.js'
import { unlinkSync } from 'node:fs'

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
  const filePath = `${directory}/${upload.id}`
  if (isNullOrUndefined(fileName)) {
    console.error('Le fichier téléversé est étrange', upload)
    unlinkSync(filePath)
    // eslint-disable-next-line no-throw-literal
    throw { body: 'Le fichier téléversé est étrange', status_code: 500 }
  }

  const extension = fileName.split('.').at(-1)
  const parsedExtension = fileUploadTypeValidator.safeParse(extension)
  if (!parsedExtension.success) {
    console.error("L'extension du fichier téléversé n'est pas autorisé", upload)
    unlinkSync(filePath)
    // eslint-disable-next-line no-throw-literal
    throw { body: "L'extension du fichier téléversé n'est pas autorisé", status_code: 500 }
  }

  if (parsedExtension.data === 'pdf') {
    if (!(await isPdf(filePath))) {
      console.error("Le fichier téléversé n'est pas un pdf valide", upload)
      unlinkSync(filePath)
      // eslint-disable-next-line no-throw-literal
      throw { body: "Le fichier téléversé n'est pas un pdf valide", status_code: 500 }
    }
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
