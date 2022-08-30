import { globalesInit } from './cache/globales'
import { knex } from '../knex'
import { utilisateursCount } from './queries/utilisateurs'
import { userSuper } from './user-super'
import { userAdd } from '../knex/user-add'
import dateFormat from 'dateformat'

const databaseInit = async () => {
  await knex.migrate.latest()
  await createAdminUserAtStartup()
  await cacheInit()
}

const cacheInit = async () => {
  await globalesInit()
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
      dateCreation: dateFormat(new Date(), 'yyyy-mm-dd')
    })
  }
}

export { databaseInit, cacheInit }
