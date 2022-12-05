import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.dropTable('devises')
}

export const down = () => ({})
