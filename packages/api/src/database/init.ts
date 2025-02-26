import { knex } from '../knex'
import { daily } from '../business/daily'
import type { Pool } from 'pg'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { config } from '../config'

export const databaseInit = async (pool: Pool): Promise<void> => {
  await knex.migrate.latest()
  if (isNotNullNorUndefined(config().CAMINO_STAGE)) {
    // pas de await pour ne pas bloquer le démarrage de l’appli
    daily(pool, '/tmp/unused') // eslint-disable-line @typescript-eslint/no-floating-promises
  }
}
