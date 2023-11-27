import fs from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import type { Pool } from 'pg'
import { Index, IUtilisateur } from '../../src/types.js'

import { app } from '../app.js'
import { utilisateurCreate, utilisateurGet } from '../../src/database/queries/utilisateurs'
import { userSuper } from '../../src/database/user-super'
import { AdminUserNotNull, isAdministrationRole, isSuperRole, UserNotNull } from 'camino-common/src/roles.js'
import { TestUser } from 'camino-common/src/tests-utils.js'
import { getCurrent } from 'camino-common/src/date.js'
import { CaminoRestRoutes, DeleteRestRoutes, getRestRoute, GetRestRoutes, PostRestRoutes, PutRestRoutes, CaminoRestParams } from 'camino-common/src/rest.js'
import { z } from 'zod'
import { newUtilisateurId } from '../../src/database/models/_format/id-create.js'
import { idUserKeycloakRecognised } from '../keycloak.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'

export const queryImport = (nom: string) =>
  fs
    .readFileSync(path.join(__dirname, `../queries/${nom}.graphql`))
    // important pour transformer le buffer en string
    .toString()

export const tokenCreate = (user: Partial<IUtilisateur>) => {
  if (isNotNullNorUndefined(process.env.JWT_SECRET)) {
    return jwt.sign(JSON.stringify(user), process.env.JWT_SECRET)
  }
  throw new Error('La variable d’environnement JWT_SECRET est manquante')
}

export const graphQLCall = async (pool: Pool, query: string, variables: Index<string | boolean | Index<string | boolean | Index<string>[] | any>>, user: TestUser | undefined) => {
  const req = request(app(pool)).post('/').send({ query, variables })

  return jwtSet(req, user)
}

export const restUploadCall = async (pool: Pool, user: TestUser) => {
  const req = request(app(pool)).post('/televersement')

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

export const restPostCall = async <Route extends PostRestRoutes>(
  pool: Pool,
  caminoRestRoute: Route,
  params: CaminoRestParams<Route>,
  user: TestUser | undefined,
  body: z.infer<(typeof CaminoRestRoutes)[Route]['post']['input']>
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
export const userTokenGenerate = async (user: TestUser) => {
  const userInDb = await userGenerate(user)

  return tokenCreate(userInDb)
}
