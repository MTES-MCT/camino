import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('alter table communes drop column departement_id')
}

export const down = () => ({})
