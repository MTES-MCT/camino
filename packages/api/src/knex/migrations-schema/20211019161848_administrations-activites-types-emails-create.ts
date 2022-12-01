import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.createTable(
    'administrations__activitesTypes__emails',
    table => {
      table
        .string('activiteTypeId', 3)
        .index()
        .references('activitesTypes.id')
        .notNullable()
        .onDelete('CASCADE')
      table
        .string('administrationId', 64)
        .notNullable()
        .index()
        .references('administrations.id')
        .onDelete('CASCADE')
      table.string('email')
      table.primary(['administrationId', 'activiteTypeId', 'email'])
    }
  )

  return knex.schema.table('activitesTypes', table => {
    table.dropColumn('email')
  })
}

export const down = (knex: Knex) =>
  knex.schema.dropTable('administrations__activitesTypes__emails')
