import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('titresDemarches', function (table) {
    table.dropForeign('statutId')
  })

  return knex.schema.dropTable('demarchesStatuts')
}

export const down = () => ({})
