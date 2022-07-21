import fs from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'
import request from 'supertest'

import { Index, IUtilisateur } from '../../src/types'

import { app } from '../app'
import {
  utilisateurCreate,
  utilisateurGet
} from '../../src/database/queries/utilisateurs'
import { userSuper } from '../../src/database/user-super'
import { AdministrationId } from 'camino-common/src/administrations'
import dateFormat from 'dateformat'
import { Role } from 'camino-common/src/roles'

const queryImport = (nom: string) =>
  fs
    .readFileSync(path.join(__dirname, `../queries/${nom}.graphql`))
    // important pour transformer le buffer en string
    .toString()

const tokenCreate = (user: Partial<IUtilisateur>) =>
  jwt.sign(user, process.env.JWT_SECRET as string)

const graphQLCall = async (
  query: string,
  variables: Index<
    string | boolean | Index<string | boolean | Index<string>[] | any>
  >,
  role?: Role,
  administrationId?: AdministrationId
) => {
  const req = request(app).post('/').send({ query, variables })

  return cookiesSet(req, role, administrationId)
}

const restUploadCall = async (role?: Role) => {
  const req = request(app).post('/televersement')

  return cookiesSet(req, role)
}

export const restCall = async (
  path: string,
  role: Role,
  administrationId?: AdministrationId
): Promise<request.Test> => {
  const req = request(app).get(path)

  return cookiesSet(req, role, administrationId)
}

export const restPostCall = async <T extends string | object | undefined>(
  path: string,
  role: Role,
  body: T,
  administrationId?: AdministrationId
): Promise<request.Test> => {
  const req = request(app).post(path).send(body)

  return cookiesSet(req, role, administrationId)
}

const cookiesSet = async (
  req: request.Test,
  role?: Role,
  administrationId?: AdministrationId
): Promise<request.Test> => {
  let token
  if (role) {
    token = await userTokenGenerate(role, administrationId)
  }

  if (token) {
    req.cookies = `accessToken=${token}`
  }

  return req
}

const userTokenGenerate = async (
  role: Role,
  administrationId?: AdministrationId
) => {
  let id = 'super'

  if (role !== 'super') {
    id = `${role}-user`

    if (administrationId) {
      id += `-${administrationId}`
    }
  }

  const userInDb = await utilisateurGet(id, undefined, userSuper)

  if (!userInDb) {
    await utilisateurCreate(
      {
        id,
        prenom: `prenom-${role}`,
        nom: `nom-${role}`,
        email: `${id}@camino.local`,
        motDePasse: 'mot-de-passe',
        dateCreation: dateFormat(new Date(), 'yyyy-mm-dd'),
        role,
        administrationId
      },
      {}
    )
  }

  return tokenCreate({ id })
}

export {
  queryImport,
  tokenCreate,
  graphQLCall,
  userTokenGenerate,
  restUploadCall
}
