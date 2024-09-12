/* eslint-disable sql/no-unsafe-query */

import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw(`update titres_etapes set type_id = 'apd' where type_id = 'wrl'`)
  await knex.raw(`update titres_etapes set type_id = 'dpu' where type_id = 'dup'`)
}

export const down = (): void => {}
