/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */

import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTable('nexistepasEtVaFairePlanterLaMigration')

  await knex.schema.dropTable('nexistepasEtVaFairePlanterLaMigration')
}

export const down = (): void => {}
