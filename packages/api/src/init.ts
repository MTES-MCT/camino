import dotenv from 'dotenv'
import { resolve } from 'path'
import { knexInit } from './knex'
import { knexConfig } from './knex/config'

dotenv.config({ path: resolve(process.cwd(), '../../.env') })

knexInit(knexConfig)
