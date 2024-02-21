import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  return knex.raw('ALTER TABLE titres DROP column entreprises_lecture')
}

export const down = () => ({})
