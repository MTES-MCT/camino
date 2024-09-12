/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */
import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw(`UPDATE titres_etapes SET type_id = 'apd' WHERE type_id = 'wrd'`)
}

export const down = (): void => {}
