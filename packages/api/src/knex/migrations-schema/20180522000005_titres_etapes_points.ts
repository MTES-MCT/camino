import { Knex } from 'knex'
export const up = (knex: Knex) => {
  return knex.schema
    .createTable('titresPoints', table => {
      table.string('id').primary()
      table.string('slug').index()
      table.string('titreEtapeId', 128).notNullable().index()
      table.foreign('titreEtapeId').references('titresEtapes.id').onUpdate('CASCADE').onDelete('CASCADE')
      table.specificType('coordonnees', 'POINT').notNullable()
      table.integer('groupe').notNullable()
      table.integer('contour').notNullable()
      table.integer('point').notNullable()
      table.string('nom')
      table.text('description')
      table.boolean('securite')
      table.boolean('subsidiaire')
      table.integer('lot')
    })
    .createTable('titresPointsReferences', table => {
      table.string('id').primary()
      table.string('slug').index()
      table.string('titrePointId').index().references('titresPoints.id').onUpdate('CASCADE').onDelete('CASCADE')
      table.string('geoSystemeId', 5).notNullable()
      table.specificType('coordonnees', 'POINT').notNullable()
      table.boolean('opposable')
    })
}

export const down = (knex: Knex) => {
  return knex.schema.dropTable('titresPointsReferences').dropTable('titresPoints')
}
