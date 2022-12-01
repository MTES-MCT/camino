import { knex } from '../knex.js'
import { utilisateursCount } from './queries/utilisateurs.js'
import { userSuper } from './user-super.js'
import { userAdd } from '../knex/user-add.js'
import { getCurrent } from 'camino-common/src/date.js'

export const databaseInit = async () => {
  await knex.migrate.latest()
  await createAdminUserAtStartup()
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
