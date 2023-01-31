import { knex } from '../knex.js'
import { utilisateursCount } from './queries/utilisateurs.js'
import { userSuper } from './user-super.js'
import { userAdd } from '../knex/user-add.js'
import { getCurrent } from 'camino-common/src/date.js'
import { toDbATE } from 'camino-common/src/static/administrationsTitresTypesEtapesTypes.js'
import { toDbATT } from 'camino-common/src/static/administrationsTitresTypesTitresStatuts.js'
import { daily } from '../business/daily.js'

export const databaseInit = async () => {
  await knex.migrate.latest()
  await knex.table('administrations__titresTypes__titresStatuts').truncate()
  await knex
    .table('administrations__titresTypes__titresStatuts')
    .insert(toDbATT())
  await knex.table('administrations__titresTypes__etapesTypes').truncate()
  await knex
    .table('administrations__titresTypes__etapesTypes')
    .insert(toDbATE())
  await createAdminUserAtStartup()

  if (process.env.CAMINO_STAGE) {
    // pas de await pour ne pas bloquer le démarrage de l’appli
    daily()
  }
}

const createAdminUserAtStartup = async () => {
  const numberOfUsers = await utilisateursCount(
    {},
    { fields: { id: {} } },
    userSuper
  )
  console.info(`${numberOfUsers} utilisateurs en base`)
  if (numberOfUsers === 0) {
    console.warn("creation de l'utilisateur super par défaut")
    await userAdd(knex, {
      id: 'admin',
      email: process.env.ADMIN_EMAIL!,
      role: 'super',
      dateCreation: getCurrent()
    })
  }
}
