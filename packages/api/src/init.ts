import dotenv from 'dotenv'
import { resolve } from 'path'
import { knexInit } from './knex.js'
import { knexConfig } from './knex/config.js'

dotenv.config({ path: resolve(process.cwd(), '../../.env') })

knexInit(knexConfig)
