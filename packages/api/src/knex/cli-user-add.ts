import { getCurrent } from 'camino-common/src/date.js'
import '../init'
import { knex } from '../knex.js'
import { userAdd } from './user-add.js'

const run = async () => {
  try {
    await userAdd(knex, {
      id: 'admin',
      email: process.env.ADMIN_EMAIL,
      role: 'super',
      dateCreation: getCurrent()
    })
  } catch (e) {
    console.error(e)
  } finally {
    process.exit(0)
  }
}

run()
