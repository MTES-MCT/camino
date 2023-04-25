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
import { geoSystemesInit } from './config/proj4.js'
import { userLoader } from './server/user-loader.js'
import { connectedCatcher } from './server/connected-catcher.js'
import cookieParser from 'cookie-parser'

consoleOverride()
geoSystemesInit()
filesInit().then(() => {
  databaseInit().then(() => {
    const app = express()
    app.disable('x-powered-by')

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
    })
    app.use(express.urlencoded({ extended: true }), express.json(), restWithPool())

    app.use('/televersement', uploadAllowedMiddleware, restUpload())

    app.use('/', graphqlUpload, graphql)

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
})
