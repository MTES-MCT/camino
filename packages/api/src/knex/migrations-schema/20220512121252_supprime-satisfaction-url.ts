import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.table('activitesTypes', table => {
    table.dropColumn('satisfactionUrl')
  })
}

export const down = () => ({})
