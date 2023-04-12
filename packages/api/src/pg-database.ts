import pg from 'pg'

export const pool = new pg.Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
})

export type Redefine<T, V> = T extends { params: infer A } ? (keyof A extends keyof V ? Omit<T, 'params'> & { params: V } : false) : false
