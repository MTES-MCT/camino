import { Knex } from 'knex'
export const up = (knex: Knex) => {
  return knex.schema.createTable('titresReferences', table => {
    table.string('titreId', 128).notNullable().index()
    table.foreign('titreId').references('titres.id').onUpdate('CASCADE').onDelete('CASCADE')
    table.string('typeId', 3).index().references('referencesTypes.id').notNullable()
    table.string('nom')
    table.primary(['titreId', 'typeId', 'nom'])
  })
}

export const down = (knex: Knex) => {
  return knex.schema.dropTable('titresReferences')
}
