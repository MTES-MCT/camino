import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('alter table titres alter column slug set not null;')
}

export const down = () => ({})
