import express from 'express'

import { graphql } from '../src/server/graphql'
import { authJwt } from '../src/server/auth-jwt'
import { restUpload, uploadAllowedMiddleware } from '../src/server/upload'
import cookieParser from 'cookie-parser'
import { rest } from '../src/server/rest'

const app = express()

app.use(cookieParser())
app.use(authJwt)

// TODO 2022-05-03: utiliser l'app principale (ou une partie)
app.use(rest)
app.use('/televersement', uploadAllowedMiddleware, restUpload())
app.use('/', graphql)

export { app }
