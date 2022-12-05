import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('substancesLegales', function (table) {
    table.dropColumn('substanceLegaleCodeId')
  })

  return knex.schema.dropTable('substancesLegalesCodes')
}

export const down = () => ({})
