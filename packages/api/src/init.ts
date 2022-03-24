import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({path: resolve(process.cwd(), '../../.env')})
import { knexInit } from './knex'
import { knexConfig } from './knex/config'


knexInit(knexConfig)
