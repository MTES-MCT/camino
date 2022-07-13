import { graphqlHTTP } from 'express-graphql'
import http from 'http'

import rootValue from '../api/graphql/resolvers'
import schema from '../api/graphql/schemas'
import {
  userByEmailGet,
  utilisateurCreate
} from '../database/queries/utilisateurs'
import { formatUser, IUtilisateur } from '../types'
import dateFormat from 'dateformat'
import { userIdGenerate } from '../api/graphql/resolvers/utilisateurs'

interface IAuthRequestHttp extends http.IncomingMessage {
  user?: {
    [id: string]: string
  }
}

const graphql = graphqlHTTP(async (req: IAuthRequestHttp, res) => {
  let user: IUtilisateur | undefined
  if (req.user?.email) {
    const userInBdd = await userByEmailGet(req.user.email)
    if (userInBdd) {
      user = userInBdd
    } else {
      user = await utilisateurCreate(
        {
          id: await userIdGenerate(),
          email: req.user.email,
          role: 'defaut',
          nom: req.user.family_name,
          prenom: req.user.given_name,
          motDePasse: 'motDePasse',
          dateCreation: dateFormat(new Date(), 'dd-mm-yyyy')
        } as IUtilisateur,
        { fields: { entreprises: { id: {} } } }
      )
    }
  }

  return Promise.resolve({
    context: { user: user ? formatUser(user) : undefined, res },
    customFormatErrorFn: err => ({
      locations: err.locations,
      message: err.message,
      path: err.path,
      stack: err.stack ? err.stack.split('\n') : []
    }),
    graphiql: true,
    pretty: true,
    rootValue,
    schema
  })
})

export { graphql }
