import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw("UPDATE titres_etapes SET statut_id = 'fai' WHERE type_id = 'dpu' AND slug like 'g-px-%'")
}

export const down = () => ({})
