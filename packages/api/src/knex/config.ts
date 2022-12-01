import 'dotenv/config'
import { join } from 'path'
import { knexSnakeCaseMappers } from 'objection'

export const connection = {
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD
}

export const knexConfig = {
  client: 'pg',
  connection,
  migrations: {
    directory: [
      join(__dirname, './migrations-schema'),
      join(__dirname, './migrations-data')
    ],
    stub: join(__dirname, './migration-stub.ts'),
    extension: 'ts',
    loadExtensions: ['.ts']
  },
  ...knexSnakeCaseMappers()
}
