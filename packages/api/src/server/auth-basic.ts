import express from 'express'
import basicAuth from 'basic-auth'
import bcrypt from 'bcryptjs'

import { debug } from '../config/index'
import { emailCheck } from '../tools/email-check'
import { userByEmailGet } from '../database/queries/utilisateurs'
import { constants } from 'http2'

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

const authBasic = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    if (req.headers.authorization) {
      const credentials = basicAuth.parse(req.headers.authorization)
      if (credentials) {
        const user = await userCredentialsCheck(
          credentials.name,
          credentials.pass
        )

        if (!user) {
          res.status(constants.HTTP_STATUS_UNAUTHORIZED)
          res.send('Identifiants incorrects')

          return
        }

        ;(req as any).user = { id: user.id }
      }
    }
  } catch (e) {
    if (debug) {
      console.error(e)
    }

    next(e)

    return
  }

  next()
}

export { authBasic }
