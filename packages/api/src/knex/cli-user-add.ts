import '../init'
import { knex } from '../knex'
import { userAdd } from './user-add'
import { IUtilisateur } from '../types'
import dateFormat from 'dateformat'

const run = async () => {
  const user = {
    id: 'admin',
    email: process.env.ADMIN_EMAIL,
    permissionId: 'super',
    dateCreation: dateFormat(new Date(), 'yyyy-mm-dd')
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
