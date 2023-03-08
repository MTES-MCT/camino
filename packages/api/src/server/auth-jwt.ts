import express from 'express'
import expressJwt from 'express-jwt'

export const authJwt = expressJwt({
  credentialsRequired: false,
  getToken: (req: express.Request) => {
    return req.headers?.['x-forwarded-access-token'] || null
  },
  secret: process.env.JWT_SECRET || 'jwtSecret should be declared in .env',
  algorithms: [process.env.JWT_SECRET_ALGORITHM || 'HS256'],
})
