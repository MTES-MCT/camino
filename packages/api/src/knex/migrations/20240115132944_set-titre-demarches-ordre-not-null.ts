import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('ALTER TABLE titres_demarches ALTER COLUMN ordre SET NOT NULL')
}

export const down = () => ({})
