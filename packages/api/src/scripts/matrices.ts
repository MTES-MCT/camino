import { matrices } from '../business/matrices.js'
import pg from 'pg'
// Le pool ne doit être qu'aux entrypoints : le daily, le monthly, et l'application.
const pool = new pg.Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
})

matrices(process.env.ANNEE ? Number.parseInt(process.env.ANNEE, 10) : 2021, pool)
  .then(() => {
    process.exit()
  })
  .catch(message => {
    console.error(message)
    process.exit(1)
  })
