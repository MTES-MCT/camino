import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw("ALTER TABLE titres_etapes ADD COLUMN demarche_ids_consentement JSONB NOT NULL DEFAULT '[]'::jsonb")
}

export const down = (): void => {}
