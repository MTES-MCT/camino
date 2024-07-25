/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */

import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw("UPDATE titres_etapes SET statut_id = 'fai' WHERE type_id = 'dpu' AND slug like 'f-%'")
}

export const down = (): void => {}
