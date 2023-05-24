import express from 'express'
import type { Pool } from 'pg'
import { graphql } from '../src/server/graphql.js'
import { authJwt } from '../src/server/auth-jwt.js'
import { restUpload, uploadAllowedMiddleware } from '../src/server/upload.js'
import { restWithPool } from '../src/server/rest.js'

export const app = (dbPool: Pool) => {
  const app = express()
  app.disable('x-powered-by')
  app.use(authJwt)
  app.use(express.urlencoded({ extended: true }), express.json(), restWithPool(dbPool))

  // TODO 2022-05-03: utiliser l'app principale (ou une partie)
  app.use('/televersement', uploadAllowedMiddleware, restUpload)
  app.use('/', graphql(dbPool))

  return app
}
