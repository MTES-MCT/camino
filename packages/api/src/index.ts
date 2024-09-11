/**
 * Camino API, le cadastre minier numérique ouvert
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import './init'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import * as Sentry from '@sentry/node'

import { config } from './config/index'
import { restWithPool } from './server/rest'
import { graphql } from './server/graphql'
import { authJwt } from './server/auth-jwt'
import { authBasic } from './server/auth-basic'
import { restUpload, uploadAllowedMiddleware } from './server/upload'
import { databaseInit } from './database/init'

import { consoleOverride } from './config/logger'
import { filesInit } from './config/files'
import { userLoader } from './server/user-loader'
import { connectedCatcher } from './server/connected-catcher'
import cookieParser from 'cookie-parser'
import pg from 'pg'
import qs from 'qs'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
// Le pool ne doit être qu'aux entrypoints : le daily, le monthly, et l'application.
const pool = new pg.Pool({
  host: config().PGHOST,
  user: config().PGUSER,
  password: config().PGPASSWORD,
  database: config().PGDATABASE,
  idleTimeoutMillis: 60000,
})

consoleOverride()
filesInit()
databaseInit(pool).then(() => {
  const app = express()
  app.disable('x-powered-by')
  app.set('query parser', function (str: string) {
    return qs.parse(str, { comma: true })
  })
  if (isNotNullNorUndefined(config().API_SENTRY_URL)) {
    Sentry.init({
      dsn: config().API_SENTRY_URL,
      environment: config().ENV === 'prod' ? 'production' : config().ENV,
    })
    Sentry.setupExpressErrorHandler(app)
  }

  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per `window` (here, per 1 minute)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    validate: false, // TODO 2024-04-29 : disable https://express-rate-limit.mintlify.app/reference/error-codes#err-erl-unexpected-x-forwarded-for en version 7, on pourra désactiver juste ça
    skip: (request: any, _response: any) => {
      // On n'applique pas de rate limiting sur le televersement des fichiers
      return request.url.startsWith('/televersement')
    },
  })

  app.use(cors({ origin: false, credentials: true, exposedHeaders: ['Content-disposition'] }), compression(), limiter, authJwt, authBasic(pool), userLoader(pool), cookieParser(), connectedCatcher)

  // Le Timeout du sse côté frontend est mis à 45 secondes, on envoie un ping toutes les 30 secondes
  const ssePingDelayInSeconds = 30
  app.get('/stream/version', async (_req, res) => {
    const headers = {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    }

    res.writeHead(200, headers)
    res.write(`id: ${Date.now()}\n`)
    res.write(`event: version\n`)
    res.write(`data: ${config().APPLICATION_VERSION}\n\n`)
    res.flush()
    let counter = 0
    const interValID = setInterval(() => {
      counter++
      if (counter >= 10) {
        clearInterval(interValID)
        res.end()

        return
      }
      res.write(`id: ${Date.now()}\n`)
      res.write(`event: version\n`)
      res.write(`data: ${config().APPLICATION_VERSION}\n\n`)
      res.flush()
    }, ssePingDelayInSeconds * 1000)

    res.on('close', () => {
      clearInterval(interValID)
      res.end()
    })
  })

  app.use(express.urlencoded({ extended: true }), express.json({ limit: '5mb' }), restWithPool(pool))

  app.use('/televersement', uploadAllowedMiddleware, restUpload())

  app.use('/', graphql(pool))

  app.listen(config().API_PORT, () => {
    console.info('')
    console.info('ENV:', config().ENV)
    console.info('NODE_ENV:', config().NODE_ENV)
    console.info('')
  })
})
