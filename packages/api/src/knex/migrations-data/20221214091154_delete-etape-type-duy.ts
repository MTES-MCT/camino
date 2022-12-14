import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw("delete from etapes_types where id = 'duy'")
}

export const down = () => ({})
