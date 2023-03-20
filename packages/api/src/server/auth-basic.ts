import express from 'express'
import { Request } from 'express-jwt'

import basicAuth from 'basic-auth'
import bcrypt from 'bcryptjs'

import { emailCheck } from '../tools/email-check.js'
import { userByEmailGet } from '../database/queries/utilisateurs.js'

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

  if (!user.qgisToken) return null
  const valid = bcrypt.compareSync(qgisToken, user.qgisToken)

  return valid ? user : null
}

export const authBasic = async (req: Request, res: express.Response, next: express.NextFunction) => {
  try {
    // basic auth est activé que pour la route titres_qgis
    if (req.url.includes('titres_qgis')) {
      const credentials = req.headers.authorization ? basicAuth.parse(req.headers.authorization) : null
      if (!credentials) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Authentication Required"')
        res.status(401)
        res.send('Authentication Required')

        return
      }

      const user = await userQGISCredentialsCheck(credentials.name, credentials.pass)

      if (!user) {
        res.status(401)
        res.send('Identifiants incorrects')

        return
      }

      // on fait comme si le JWT avait été déchiffré pour que l’utilisateur soit chargé par userLoader
      req.auth = { email: user.email, family_name: user.nom, given_name: user.prenom }
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
