import { toCaminoAnnee } from 'camino-common/src/date.js'
import { matrices } from '../business/matrices.js'
import pg from 'pg'
// Le pool ne doit être qu'aux entrypoints : le daily, le monthly, et l'application.
const pool = new pg.Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
})

matrices(process.env.ANNEE ? toCaminoAnnee(process.env.ANNEE) : toCaminoAnnee(2021), pool)
  .then(() => {
    process.exit()
  })
  .catch(message => {
    console.error(message)
    process.exit(1)
  })
