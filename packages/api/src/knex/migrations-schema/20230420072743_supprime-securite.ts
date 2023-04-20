import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('alter table titres_points drop column "securite"')
}

export const down = () => ({})
