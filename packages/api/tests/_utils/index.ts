import fs from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'
import request from 'supertest'

import { Index, IUtilisateur } from '../../src/types.js'

import { app } from '../app.js'
import {
  utilisateurCreate,
  utilisateurGet
} from '../../src/database/queries/utilisateurs'
import { userSuper } from '../../src/database/user-super'
import {
  AdminUserNotNull,
  isAdministrationRole,
  isSuperRole
} from 'camino-common/src/roles.js'
import { TestUser } from 'camino-common/src/tests-utils.js'
import { getCurrent } from 'camino-common/src/date.js'

export const queryImport = (nom: string) =>
  fs
    .readFileSync(path.join(__dirname, `../queries/${nom}.graphql`))
    // important pour transformer le buffer en string
    .toString()

export const tokenCreate = (user: Partial<IUtilisateur>) => {
  if (process.env.JWT_SECRET) {
    return jwt.sign(JSON.stringify(user), process.env.JWT_SECRET)
  }
  throw new Error('La variable d’environnement JWT_SECRET est manquante')
}

export const graphQLCall = async (
  query: string,
  variables: Index<
    string | boolean | Index<string | boolean | Index<string>[] | any>
  >,
  user: TestUser | undefined
) => {
  const req = request(app).post('/').send({ query, variables })

  return jwtSet(req, user)
}

export const restUploadCall = async (user: TestUser) => {
  const req = request(app).post('/televersement')

  return jwtSet(req, user)
}

export const restCall = async (
  path: string,
  user: TestUser | undefined
): Promise<request.Test> => {
  const req = request(app).get(path)

  return jwtSet(req, user)
}

export const restPostCall = async <T extends string | object | undefined>(
  path: string,
  user: TestUser | undefined,
  body: T
): Promise<request.Test> => {
  const req = request(app).post(path).send(body)

  return jwtSet(req, user)
}

const jwtSet = async (
  req: request.Test,
  user: TestUser | undefined
): Promise<request.Test> => {
  let token
  if (user) {
    token = await userTokenGenerate(user)
  }

  if (token) {
    req.set('x-forwarded-access-token', token)
  }

  return req
}

export const userGenerate = async (user: TestUser) => {
  let id = 'super'

  if (!isSuperRole(user.role)) {
    id = `${user.role}-user`

    if (isAdministrationRole(user.role)) {
      id += `-${(user as AdminUserNotNull).administrationId}`
    }
  }

  let userInDb = await utilisateurGet(id, undefined, userSuper)

  if (!userInDb) {
    userInDb = await utilisateurCreate(
      {
        ...user,
        id,
        prenom: `prenom-${user.role}`,
        nom: `nom-${user.role}`,
        email: `${id}@camino.local`,
        dateCreation: getCurrent()
      },
      {}
    )
  }

  return userInDb
}
export const userTokenGenerate = async (user: TestUser) => {
  const userInDb = await userGenerate(user)

  return tokenCreate(userInDb)
}
