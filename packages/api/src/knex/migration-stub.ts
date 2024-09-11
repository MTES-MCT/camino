import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTable('nexistepasEtVaFairePlanterLaMigration')
}

export const down = (): void => {}
