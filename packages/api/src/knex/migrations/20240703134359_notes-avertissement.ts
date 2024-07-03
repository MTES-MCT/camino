import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('ALTER TABLE titres_etapes ADD COLUMN notes_avertissement BOOLEAN DEFAULT FALSE')
}

export const down = () => ({})
