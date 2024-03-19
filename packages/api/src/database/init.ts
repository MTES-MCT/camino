import { knex } from '../knex.js'
import { daily } from '../business/daily.js'
import type { Pool } from 'pg'
import { config } from '../config/index.js'

export const databaseInit = async (pool: Pool) => {
  await knex.migrate.latest()
  if (config().CAMINO_STAGE) {
    // pas de await pour ne pas bloquer le démarrage de l’appli
    daily(pool)
  }
}
