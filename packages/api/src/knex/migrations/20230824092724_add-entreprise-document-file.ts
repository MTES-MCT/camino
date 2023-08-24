import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  return knex.raw('alter table entreprises_documents add file oid;')
}

export const down = () => ({})
