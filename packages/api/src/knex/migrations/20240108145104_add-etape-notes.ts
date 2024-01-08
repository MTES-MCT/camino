import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  return knex.raw('alter table titres_etapes add notes text;')
}

export const down = () => ({})
