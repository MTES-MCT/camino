import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  // FIXME
  await knex.schema.dropTable('nexistepasEtVaFairePlanterLaMigration')

  return knex.schema.dropTable('nexistepasEtVaFairePlanterLaMigration')
}

export const down = () => ({})
