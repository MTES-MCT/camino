/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */

import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw('CREATE INDEX index_geo_communes ON public.communes USING spgist (geometry)')
}

export const down = (): void => {}
