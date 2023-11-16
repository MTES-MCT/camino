import { getCurrentAnnee, toCaminoAnnee } from 'camino-common/src/date.js'
import { matrices } from '../business/matrices.js'
import pg from 'pg'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'
// Le pool ne doit être qu'aux entrypoints : le daily, le monthly, et l'application.
const pool = new pg.Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
})

matrices(isNotNullNorUndefined(process.env.ANNEE) ? toCaminoAnnee(process.env.ANNEE) : getCurrentAnnee(), pool)
  .then(() => {
    process.exit()
  })
  .catch(message => {
    console.error(message)
    process.exit(1)
  })
