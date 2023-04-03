import { knex } from '../knex.js'
import { daily } from '../business/daily.js'

export const databaseInit = async () => {
  await knex.migrate.latest()
  if (process.env.CAMINO_STAGE) {
    // pas de await pour ne pas bloquer le démarrage de l’appli
    daily()
  }
}
