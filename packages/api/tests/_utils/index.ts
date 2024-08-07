import fs from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import type { Pool } from 'pg'
import { Index, IUtilisateur } from '../../src/types'

import { app } from '../app'
import { utilisateurCreate, utilisateurGet } from '../../src/database/queries/utilisateurs'
import { userSuper } from '../../src/database/user-super'
import { AdminUserNotNull, isAdministrationRole, isSuperRole, UserNotNull } from 'camino-common/src/roles'
import { TestUser } from 'camino-common/src/tests-utils'
import { getCurrent } from 'camino-common/src/date'
import {
  CaminoRestRoutes,
  DeleteRestRoutes,
  getRestRoute,
  GetRestRoutes,
  PostRestRoutes,
  PutRestRoutes,
  CaminoRestParams,
  DownloadRestRoutes,
  NewPostRestRoutes,
  NewGetRestRoutes,
} from 'camino-common/src/rest'
import { z } from 'zod'
import { newUtilisateurId } from '../../src/database/models/_format/id-create'
import { idUserKeycloakRecognised } from '../keycloak'
import { DeepReadonly, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { config } from '../../src/config/index'

export const queryImport = (nom: string): string =>
  fs
    .readFileSync(path.join(__dirname, `../queries/${nom}.graphql`))
    // important pour transformer le buffer en string
    .toString()

const tokenCreate = (user: Partial<IUtilisateur>) => {
  return jwt.sign(JSON.stringify(user), config().JWT_SECRET)
}

export const graphQLCall = async (
  pool: Pool,
  query: string,
  variables: Index<string | boolean | Index<string | boolean | Index<string>[] | any>>,
  user: TestUser | undefined
): Promise<request.Test> => {
  const req = request(app(pool)).post('/').send({ query, variables })

  return jwtSet(req, user)
}

export const restDownloadCall = async <Route extends DownloadRestRoutes>(
  pool: Pool,
  route: Route,
  params: CaminoRestParams<Route>,
  user: TestUser | undefined,
  searchParams?: Record<string, string | string[]>
): Promise<request.Test> => {
  const req = request(app(pool)).get(getRestRoute(route, params, searchParams))

  return jwtSet(req, user)
}

export const restCall = async <Route extends GetRestRoutes>(
  pool: Pool,
  route: Route,
  params: CaminoRestParams<Route>,
  user: TestUser | undefined,
  searchParams?: Record<string, string | string[]>
): Promise<request.Test> => {
  const req = request(app(pool)).get(getRestRoute(route, params, searchParams))

  return jwtSet(req, user)
}

export const restNewCall = async <Route extends NewGetRestRoutes>(
  pool: Pool,
  route: Route,
  params: CaminoRestParams<Route>,
  user: TestUser | undefined,
  searchParams?: DeepReadonly<z.infer<(typeof CaminoRestRoutes)[Route]['newGet']['searchParams']>>
): Promise<request.Test> => {
  // @ts-ignore
  const req = request(app(pool)).get(getRestRoute(route, params, searchParams))

  return jwtSet(req, user)
}

export const restPostCall = async <Route extends PostRestRoutes>(
  pool: Pool,
  caminoRestRoute: Route,
  params: CaminoRestParams<Route>,
  user: TestUser | undefined,
  body: DeepReadonly<z.infer<(typeof CaminoRestRoutes)[Route]['post']['input']>>
): Promise<request.Test> => {
  const req = request(app(pool))
    .post(getRestRoute(caminoRestRoute, params))
    .send(body ?? undefined)

  return jwtSet(req, user)
}
export const restNewPostCall = async <Route extends NewPostRestRoutes>(
  pool: Pool,
  caminoRestRoute: Route,
  params: CaminoRestParams<Route>,
  user: TestUser | undefined,
  body: DeepReadonly<z.infer<(typeof CaminoRestRoutes)[Route]['newPost']['input']>>
): Promise<request.Test> => {
  const req = request(app(pool))
    .post(getRestRoute(caminoRestRoute, params))
    .send(body ?? undefined)

  return jwtSet(req, user)
}

export const restPutCall = async <Route extends PutRestRoutes>(
  pool: Pool,
  path: Route,
  params: CaminoRestParams<Route>,
  user: TestUser | undefined,
  body: z.infer<(typeof CaminoRestRoutes)[Route]['put']['input']>
): Promise<request.Test> => {
  const req = request(app(pool))
    .put(getRestRoute(path, params))
    .send(body ?? undefined)

  return jwtSet(req, user)
}

export const restDeleteCall = async <Route extends DeleteRestRoutes>(pool: Pool, path: Route, params: CaminoRestParams<Route>, user: TestUser | undefined): Promise<request.Test> => {
  const req = request(app(pool)).delete(getRestRoute(path, params)).send()

  return jwtSet(req, user)
}

const jwtSet = async (req: request.Test, user: TestUser | undefined): Promise<request.Test> => {
  let token
  if (user) {
    token = await userTokenGenerate(user)
  }

  if (isNotNullNorUndefined(token)) {
    req.set('x-forwarded-access-token', token)
    req.set('authorization', 'falseauthorizationtoken')
  }

  return req
}

export const userGenerate = async (user: TestUser): Promise<UserNotNull> => {
  let idToBuild = 'super'

  if (!isSuperRole(user.role)) {
    idToBuild = `${user.role}-user`

    if (isAdministrationRole(user.role)) {
      idToBuild += `-${(user as AdminUserNotNull).administrationId}`
    }
  }

  const id = newUtilisateurId(idToBuild)

  let userInDb = await utilisateurGet(id, undefined, userSuper)

  if (!userInDb) {
    userInDb = await utilisateurCreate(
      {
        ...user,
        id,
        prenom: `prenom-${user.role}`,
        nom: `nom-${user.role}`,
        email: `${id}@camino.local`,
        dateCreation: getCurrent(),
        keycloakId: idUserKeycloakRecognised,
      },
      {}
    )
  }

  // TODO 2023-05-24: pg-typed utilisateurCreate and utilisateurGet
  return userInDb as UserNotNull
}
const userTokenGenerate = async (user: TestUser) => {
  const userInDb = await userGenerate(user)

  return tokenCreate(userInDb)
}
