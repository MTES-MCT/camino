import { createHandler } from 'graphql-http/lib/use/express'
import type { Pool } from 'pg'

import rootValue from '../api/graphql/resolvers'
import schema from '../api/graphql/schemas'
import type { Handler } from 'express'

export const graphql = (pool: Pool): Handler =>
  createHandler({
    context: async (req, res) => {
      // @ts-ignore auth vient de userLoader qui est placé plus haut dans le pipeline express
      return { user: req.raw.auth, pool, res }
    },
    rootValue,
    schema,
  })
