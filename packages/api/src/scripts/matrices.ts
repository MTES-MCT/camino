import { matrices } from '../business/matrices.js'
import pg from 'pg'
import { config } from '../config/index.js'
// Le pool ne doit être qu'aux entrypoints : le daily, le monthly, et l'application.
const pool = new pg.Pool({
  host: config().PGHOST,
  user: config().PGUSER,
  password: config().PGPASSWORD,
  database: config().PGDATABASE,
})

matrices(config().ANNEE, pool)
  .then(() => {
    process.exit()
  })
  .catch(message => {
    console.error(message)
    process.exit(1)
  })
