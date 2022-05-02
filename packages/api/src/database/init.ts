import { metasInit } from './cache/metas'
import { globalesInit } from './cache/globales'
import { geoSystemesInit } from './cache/geo-systemes'
import { knex } from '../knex'
import { utilisateursCount } from './queries/utilisateurs'
import { userSuper } from './user-super'
import { userAdd } from '../knex/user-add'
import { IUtilisateur } from '../types'

const databaseInit = async () => {
  await knex.migrate.latest()
  await createAdminUserAtStartup()
  await cacheInit()
}

const cacheInit = async () => {
  await metasInit()
  await globalesInit()
  await geoSystemesInit()
}

const createAdminUserAtStartup = async () => {
  const numberOfUsers = await utilisateursCount(
    {},
    { fields: { id: {} } },
    userSuper
  )
  console.log(`${numberOfUsers} utilisateurs en base`)
  if (numberOfUsers === 0) {
    console.log("creation de l'utilisateur super par défaut")
    const user = {
      id: 'admin',
      email: process.env.ADMIN_EMAIL,
      permissionId: 'super'
    } as IUtilisateur
    await userAdd(knex, user)
  }
}

export { databaseInit, cacheInit }
