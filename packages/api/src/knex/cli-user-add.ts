import '../init'
import { knex } from '../knex'
import { userAdd } from './user-add'
import { IUtilisateur } from '../types'

const run = async () => {
  const user = {
    id: 'admin',
    email: process.env.ADMIN_EMAIL,
    permissionId: 'super',
    motDePasse: process.env.ADMIN_PASSWORD
  } as IUtilisateur

  try {
    await userAdd(knex, user)
  } catch (e) {
    console.error(e)
  } finally {
    process.exit(0)
  }
}

run()
