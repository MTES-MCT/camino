import express from 'express'
import type { Pool } from 'pg'
import { graphql } from '../src/server/graphql'
import { authJwt } from '../src/server/auth-jwt'
import { restUpload, uploadAllowedMiddleware } from '../src/server/upload'
import { restWithPool } from '../src/server/rest'
import qs from 'qs'
export const app = (dbPool: Pool) => {
  const app = express()
  app.disable('x-powered-by')
  app.set('query parser', function (str: string) {
    return qs.parse(str, { comma: true })
  })
  app.use(authJwt)
  app.use(express.urlencoded({ extended: true }), express.json(), restWithPool(dbPool))

  // TODO 2022-05-03: utiliser l'app principale (ou une partie)
  app.use('/televersement', uploadAllowedMiddleware, restUpload)
  app.use('/', graphql(dbPool))

  return app
}
