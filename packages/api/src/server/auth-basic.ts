import express from 'express'
import { Request } from 'express-jwt'

import basicAuth from 'basic-auth'
import bcrypt from 'bcryptjs'

import { emailCheck } from '../tools/email-check'
import { userByEmailGet } from '../database/queries/utilisateurs'
import { JWTUser } from './user-loader'
import { isNullOrUndefined, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

const userQGISCredentialsCheck = async (email: string, qgisToken: string) => {
  email = email.toLowerCase()
  if (!emailCheck(email)) {
    throw new Error('adresse email invalide')
  }

  let user

  try {
    user = await userByEmailGet(email)

    if (!user) return null
  } catch (e: any) {
    throw new Error(`Erreur technique : ${e.message}, email ${email} invalide`)
  }

  if (isNullOrUndefined(user.qgisToken)) return null
  const valid = bcrypt.compareSync(qgisToken, user.qgisToken)

  return valid ? user : null
}

export const authBasic = async (req: Request, res: express.Response, next: express.NextFunction) => {
  try {
    // basic auth est activé que pour la route titres_qgis
    if (req.url.includes('titres_qgis')) {
      const credentials = isNotNullNorUndefined(req.headers.authorization) ? basicAuth.parse(req.headers.authorization) : null
      if (isNullOrUndefined(credentials)) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Authentication Required"')
        res.status(401)
        res.send('Authentication Required')

        return
      }

      // Ceci est dû au fait que QGIS, parfois, escape le %40 au lieu de le transformer en @ correctement...
      const user = await userQGISCredentialsCheck(credentials.name.replace('%40', '@'), credentials.pass)

      if (!user) {
        res.status(401)
        res.send('Identifiants incorrects')

        return
      }

      // on fait comme si le JWT avait été déchiffré pour que l’utilisateur soit chargé par userLoader
      const jwtUser: JWTUser = { email: user.email ?? undefined, family_name: user.nom ?? undefined, given_name: user.prenom ?? undefined, sub: user.keycloakId ?? undefined }
      req.auth = jwtUser
      next()

      return
    }
  } catch (e) {
    console.error(e)

    next(e)

    return
  }

  next()
}
