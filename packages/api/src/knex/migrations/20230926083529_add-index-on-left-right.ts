import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('CREATE INDEX titres_domaines_idx ON titres (right(type_id, 1))')
  await knex.raw('CREATE INDEX titres_types_types_idx ON titres (left(type_id, 2))')
}

export const down = () => ({})
