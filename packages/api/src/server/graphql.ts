import { graphqlHTTP } from 'express-graphql'
import http from 'http'

import rootValue from '../api/graphql/resolvers.js'
import schema from '../api/graphql/schemas.js'

interface IAuthRequestHttp extends http.IncomingMessage {
  auth?: {
    [id: string]: string
  }
}

export const graphql = graphqlHTTP(async (req: IAuthRequestHttp, res) => {
  return {
    context: { user: req.auth, res },
    customFormatErrorFn: err => ({
      locations: err.locations,
      message: err.message,
      path: err.path,
      stack: err.stack ? err.stack.split('\n') : [],
    }),
    graphiql: true,
    pretty: true,
    rootValue,
    schema,
  }
})
