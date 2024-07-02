import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw("UPDATE titres_etapes SET statut_id = 'fai', is_brouillon = TRUE WHERE type_id = 'ppu' AND statut_id = 'pro'")
}

export const down = () => ({})
