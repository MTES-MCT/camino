import 'dotenv/config'
import { knexSnakeCaseMappers } from 'objection'
import path, { join } from 'node:path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const connection = {
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
}

export const knexConfig = {
  client: 'pg',
  connection,
  migrations: {
    directory: [join(__dirname, './migrations')],
    stub: join(__dirname, './migration-stub.ts'),
    extension: 'ts',
    loadExtensions: ['.ts'],
  },
  ...knexSnakeCaseMappers(),
}
