import 'dotenv/config'
import { knexSnakeCaseMappers } from 'objection'
import path, { join } from 'node:path'
import { fileURLToPath } from 'url'
import { config } from '../config/index.js'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const connection = {
  host: config().PGHOST,
  port: config().PGPORT,
  database: config().PGDATABASE,
  user: config().PGUSER,
  password: config().PGPASSWORD,
}

export const simpleKnexConfig = {
  client: 'pg',
  connection,
  migrations: {
    directory: [join(__dirname, './migrations')],
    stub: join(__dirname, './migration-stub.ts'),
    extension: 'ts',
    loadExtensions: ['.ts'],
  },
}
export const knexConfig = {
  ...simpleKnexConfig,
  ...knexSnakeCaseMappers(),
}
