import { Knex } from 'knex'
export const up = (knex: Knex) =>
  knex.schema.createTable('titres', table => {
    table.string('id', 128).primary()
    table.string('slug').index()
    table.string('nom').notNullable()
    table.string('typeId', 3).index().references('titresTypes.id').notNullable()
    table.string('domaineId', 1).index().references('domaines.id').notNullable()
    table.string('statutId', 3).index().references('titresStatuts.id').notNullable().defaultTo('ind')
    table.string('dateDebut', 10)
    table.string('dateFin', 10)
    table.string('dateDemande', 10)
    table.boolean('publicLecture').defaultTo(false)
    table.boolean('entreprisesLecture').defaultTo(false)
    table.string('doublonTitreId', 128)
    table.jsonb('contenusTitreEtapesIds')
    table.jsonb('propsTitreEtapesIds').defaultTo({})
    table.specificType('coordonnees', 'POINT')
  })

export const down = (knex: Knex) => knex.schema.dropTable('titres')
