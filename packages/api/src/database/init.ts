import { knex } from '../knex'
import { daily } from '../business/daily'
import type { Pool } from 'pg'
import { config } from '../config/index'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

export const databaseInit = async (pool: Pool) => {
  await knex.migrate.latest()
  if (isNotNullNorUndefined(config().CAMINO_STAGE)) {
    // pas de await pour ne pas bloquer le démarrage de l’appli
    daily(pool)
  }
}
