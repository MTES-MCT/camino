import express from 'express'
import basicAuth from 'basic-auth'
import bcrypt from 'bcryptjs'

import { emailCheck } from '../tools/email-check.js'
import { userByEmailGet } from '../database/queries/utilisateurs.js'

const userCredentialsCheck = async (email: string, motDePasse: string) => {
  email = email.toLowerCase()
  if (!emailCheck(email)) {
    throw new Error('adresse email invalide')
  }

  let user

  try {
    user = await userByEmailGet(email, {})

    if (!user) return null
  } catch (e: any) {
    throw new Error(`Erreur technique : ${e.message}, email ${email} invalide`)
  }

  const valid = bcrypt.compareSync(motDePasse, user.motDePasse!)

  return valid ? user : null
}

const userQGISCredentialsCheck = async (email: string, qgisToken: string) => {
  email = email.toLowerCase()
  if (!emailCheck(email)) {
    throw new Error('adresse email invalide')
  }

  let user

  try {
    user = await userByEmailGet(email, {})

    if (!user) return null
  } catch (e: any) {
    throw new Error(`Erreur technique : ${e.message}, email ${email} invalide`)
  }

  if (!user.qgisToken) return null
  const valid = bcrypt.compareSync(qgisToken, user.qgisToken)

  return valid ? user : null
}

export const authBasic = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    if (req.url.includes('titres_qgis')) {
      const credentials = req.headers.authorization
        ? basicAuth.parse(req.headers.authorization)
        : null
      if (!credentials) {
        res.setHeader(
          'WWW-Authenticate',
          'Basic realm="Authentication Required"'
        )
        res.status(401)
        res.send('Authentication Required')

        return
      }

      const user = await userQGISCredentialsCheck(
        credentials.name,
        credentials.pass
      )

      if (!user) {
        res.status(401)
        res.send('Identifiants incorrects')

        return
      }

      req.user = { id: user.id }
      next()

      return
    }
    if (req.headers.authorization) {
      const credentials = basicAuth.parse(req.headers.authorization)
      if (credentials) {
        const user = await userCredentialsCheck(
          credentials.name,
          credentials.pass
        )

        if (!user) {
          res.status(401)
          res.send('Identifiants incorrects')

          return
        }

        req.user = { id: user.id }
      }
    }
  } catch (e) {
    console.error(e)

    next(e)

    return
  }

  next()
}
