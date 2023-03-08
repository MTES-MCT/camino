import { knex } from '../knex.js'
import { toDbATE } from 'camino-common/src/static/administrationsTitresTypesEtapesTypes.js'
import { toDbATT } from 'camino-common/src/static/administrationsTitresTypesTitresStatuts.js'
import { daily } from '../business/daily.js'

export const databaseInit = async () => {
  await knex.migrate.latest()
  await knex.table('administrations__titresTypes__titresStatuts').truncate()
  await knex.table('administrations__titresTypes__titresStatuts').insert(toDbATT())
  await knex.table('administrations__titresTypes__etapesTypes').truncate()
  await knex.table('administrations__titresTypes__etapesTypes').insert(toDbATE())
  if (process.env.CAMINO_STAGE) {
    // pas de await pour ne pas bloquer le démarrage de l’appli
    daily()
  }
}
