import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('utilisateurs', function (table) {
    table.string('dateCreation')
  })

  await knex('utilisateurs').update({ dateCreation: '1970-01-01' })

  await knex.schema.alterTable('utilisateurs', function (table) {
    table.dropNullable('dateCreation')
  })
}

export const down = () => ({})
