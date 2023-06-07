import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw("ALTER TABLE titres_etapes ALTER COLUMN ordre SET NOT NULL")
  await knex.raw("ALTER TABLE titres_etapes ALTER COLUMN ordre SET DEFAULT 0")
}

export const down = () => ({})
