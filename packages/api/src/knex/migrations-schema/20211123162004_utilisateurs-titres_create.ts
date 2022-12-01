import { Knex } from 'knex'
export const up = (knex: Knex) =>
  knex.schema.createTable('utilisateurs__titres', table => {
    table
      .string('utilisateurId')
      .index()
      .references('utilisateurs.id')
      .onDelete('CASCADE')
    table.string('titreId').index().references('titres.id').onDelete('CASCADE')
    table.primary(['utilisateurId', 'titreId'])
  })

export const down = (knex: Knex) =>
  knex.schema.dropTable('utilisateurs__titres')
