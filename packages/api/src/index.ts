/**
 * Camino API, le cadastre minier numérique ouvert
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import './init.js'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import * as Sentry from '@sentry/node'

import { port, url } from './config/index.js'
import { restWithPool } from './server/rest.js'
import { graphql } from './server/graphql.js'
import { authJwt } from './server/auth-jwt.js'
import { authBasic } from './server/auth-basic.js'
import { restUpload, graphqlUpload, uploadAllowedMiddleware } from './server/upload.js'
import { databaseInit } from './database/init.js'

import { consoleOverride } from './config/logger.js'
import { filesInit } from './config/files.js'
import { userLoader } from './server/user-loader.js'
import { connectedCatcher } from './server/connected-catcher.js'
import cookieParser from 'cookie-parser'
import pg from 'pg'
import qs from 'qs'
// Le pool ne doit être qu'aux entrypoints : le daily, le monthly, et l'application.
const pool = new pg.Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
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
  if (process.env.API_SENTRY_URL) {
    Sentry.init({
      dsn: process.env.API_SENTRY_URL,
      environment: process.env.ENV === 'prod' ? 'production' : process.env.ENV,
    })
    app.use(Sentry.Handlers.requestHandler())
  }

  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per `window` (here, per 1 minute)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (request: any, _response: any) => {
      // On n'applique pas de rate limiting sur le televersement des fichiers
      return request.url.startsWith('/televersement')
    },
  })

  app.use(cors({ credentials: true, exposedHeaders: ['Content-disposition'] }), compression(), limiter, authJwt, authBasic, userLoader, cookieParser(), connectedCatcher)

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
    res.write(`data: ${process.env.APPLICATION_VERSION}\n\n`)
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
      res.write(`data: ${process.env.APPLICATION_VERSION}\n\n`)
      res.flush()
    }, ssePingDelayInSeconds * 1000)

    res.on('close', () => {
      clearInterval(interValID)
      res.end()
    })
  })

  app.use(express.urlencoded({ extended: true }), express.json({ limit: '5mb' }), restWithPool(pool))

  app.use('/televersement', uploadAllowedMiddleware, restUpload())

  app.use('/', graphqlUpload, graphql(pool))

  if (process.env.API_SENTRY_URL) {
    app.use(Sentry.Handlers.errorHandler())
  }

  app.listen(port, () => {
    console.info('')
    console.info('URL:', url)
    console.info('ENV:', process.env.ENV)
    console.info('NODE_ENV:', process.env.NODE_ENV)

    if (process.env.NODE_DEBUG === 'true') {
      console.warn('NODE_DEBUG:', process.env.NODE_DEBUG)
    }
    console.info('')
  })
})
