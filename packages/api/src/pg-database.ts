import pg from 'pg'

export const pool = new pg.Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
})

export type Redefine<T, P, O> = T extends { params: infer A; result: infer B }
  ? { inputs: keyof A; outputs: keyof B } extends { inputs: keyof P; outputs: keyof O }
    ? { inputs: keyof P; outputs: keyof O } extends { inputs: keyof A; outputs: keyof B }
      ? { params: P; result: O }
      : false
    : false
  : false
