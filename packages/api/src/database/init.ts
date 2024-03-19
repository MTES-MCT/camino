import { knex } from '../knex.js'
import { daily } from '../business/daily.js'
import type { Pool } from 'pg'
import { config } from '../config/index.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'

export const databaseInit = async (pool: Pool) => {
  await knex.migrate.latest()
  if (isNotNullNorUndefined(config().CAMINO_STAGE)) {
    // pas de await pour ne pas bloquer le démarrage de l’appli
    daily(pool)
  }
}
