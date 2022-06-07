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
import {
  AdministrationId,
  Administrations
} from 'camino-common/src/administrations'
import dateFormat from 'dateformat'
import { PermissionId } from 'camino-common/src/permissions'

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
  permissionId?: PermissionId,
  administrationId?: string
) => {
  const req = request(app).post('/').send({ query, variables })

  return cookiesSet(req, permissionId, administrationId)
}

const restUploadCall = async (permissionId?: PermissionId) => {
  const req = request(app).post('/televersement')

  return cookiesSet(req, permissionId)
}

export const restCall = async (
  path: string,
  permissionId: PermissionId,
  administrationId?: AdministrationId
): Promise<request.Test> => {
  const req = request(app).get(path)

  return cookiesSet(req, permissionId, administrationId)
}

const cookiesSet = async (
  req: request.Test,
  permissionId?: PermissionId,
  administrationId?: string
): Promise<request.Test> => {
  let token
  if (permissionId) {
    token = await userTokenGenerate(permissionId, administrationId)
  }

  if (token) {
    req.cookies = `accessToken=${token}`
  }

  return req
}

const userTokenGenerate = async (
  permissionId: PermissionId,
  administrationId?: string
) => {
  let id = 'super'

  if (permissionId !== 'super') {
    id = `${permissionId}-user`

    if (administrationId) {
      id += `-${administrationId}`
    }
  }

  const userInDb = await utilisateurGet(id, undefined, userSuper)

  if (!userInDb) {
    const administrations = []

    if (administrationId && administrationId in Administrations) {
      administrations.push(
        Administrations[administrationId as AdministrationId]
      )
    }

    await utilisateurCreate(
      {
        id,
        prenom: `prenom-${permissionId}`,
        nom: `nom-${permissionId}`,
        email: `${id}@camino.local`,
        motDePasse: 'mot-de-passe',
        dateCreation: dateFormat(new Date(), 'yyyy-mm-dd'),
        permissionId,
        administrations
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
