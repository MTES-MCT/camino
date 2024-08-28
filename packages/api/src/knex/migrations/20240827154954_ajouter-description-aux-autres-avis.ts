/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */

import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw(`UPDATE etape_avis SET description = 'avis' WHERE avis_type_id = 'autreAvis' AND LENGTH(description) = 0`)
}

export const down = (): void => {}
