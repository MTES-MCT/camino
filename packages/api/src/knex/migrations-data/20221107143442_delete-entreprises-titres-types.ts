import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.dropTable('entreprises__titresTypes')
}

export const down = () => ({})
