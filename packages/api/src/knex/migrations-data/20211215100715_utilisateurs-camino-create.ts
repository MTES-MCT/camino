import { Knex } from 'knex'
import { idGenerate } from '../../database/models/_format/id-create.js'
import { userSuper } from '../../database/user-super.js'

export const up = async (knex: Knex) => {
  await knex('utilisateurs').insert({
    ...userSuper,
    motDePasse: idGenerate()
  })
}
export const down = () => ({})
