import { globalesInit } from './cache/globales'
import { knex } from '../knex'
import { utilisateursCount } from './queries/utilisateurs'
import { userSuper } from './user-super'

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
  console.log(`${numberOfUsers} utilisateurs en base`)
  // FIXME
  // if (numberOfUsers === 0) {
  //   console.log("creation de l'utilisateur super par défaut")
  //   await userAdd(knex, {
  //     id: 'admin',
  //     email: process.env.ADMIN_EMAIL ?? 'trash@not.here',
  //     role: 'super',
  //   })
  // }
}

export { databaseInit, cacheInit }
