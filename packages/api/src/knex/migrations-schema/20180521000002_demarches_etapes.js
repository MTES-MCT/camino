exports.up = knex => {
  return knex.schema
    .createTable('demarchesTypes', table => {
      table.string('id', 3).primary()
      table.string('nom').notNullable()
      table.text('description')
      table.integer('ordre')
      table.boolean('duree')
      table.boolean('points')
      table.boolean('substances')
      table.boolean('titulaires')
      table.boolean('renouvelable')
      table.boolean('exception')
      table.boolean('auto')
    })
    .createTable('titresTypes__demarchesTypes', table => {
      table
        .string('titreTypeId', 3)
        .index()
        .references('titresTypes.id')
        .notNullable()
      table
        .string('demarcheTypeId', 3)
        .index()
        .references('demarchesTypes.id')
        .notNullable()
      table.integer('dureeMax')
      table.boolean('acceptationImplicite')
      table.string('delaiImplicite')
      table.string('delaiRecours')
      table.string('legalRef')
      table.string('legalLien')
      table.string('dateDebut', 10)
      table.string('dateFin', 10)
      table.primary(['titreTypeId', 'demarcheTypeId'])
    })
    .createTable('demarchesStatuts', table => {
      table.string('id', 3).primary()
      table.string('nom', 32).notNullable()
      table.text('description')
      table.string('couleur', 16).notNullable()
      table.integer('ordre').notNullable()
    })
    .createTable('phasesStatuts', table => {
      table.string('id', 3).primary()
      table.string('nom', 32).notNullable()
      table.string('couleur', 16).notNullable()
    })
    .createTable('etapesTypes', table => {
      table.string('id', 3).primary()
      table.string('parentId', 3).references('etapesTypes.id')
      table.string('nom', 128)
      table.text('description')
      table.integer('ordre').notNullable()
      table.boolean('fondamentale')
      table.boolean('unique')
      table.boolean('acceptationAuto')
      table.string('legalRef')
      table.string('legalLien')
      table.string('dateDebut', 10)
      table.string('dateFin', 10)
      table.specificType('sections', 'jsonb[]')
      table.boolean('publicLecture')
      table.boolean('entreprisesLecture')
    })
    .createTable('titresTypes__demarchesTypes__etapesTypes', table => {
      table
        .string('titreTypeId', 3)
        .index()
        .references('titresTypes.id')
        .notNullable()
      table.integer('ordre')
      table
        .string('demarcheTypeId', 7)
        .index()
        .references('demarchesTypes.id')
        .notNullable()
      table
        .string('etapeTypeId', 3)
        .index()
        .references('etapesTypes.id')
        .notNullable()
      table.specificType('sections', 'jsonb[]')
      table.primary(['titreTypeId', 'demarcheTypeId', 'etapeTypeId'])
    })
    .createTable('etapesStatuts', table => {
      table.string('id', 3).primary()
      table.string('nom', 32).notNullable()
      table.text('description')
      table.string('couleur', 16).notNullable()
    })
    .createTable('etapesTypes__etapesStatuts', table => {
      table
        .string('etapeTypeId', 3)
        .index()
        .references('etapesTypes.id')
        .notNullable()
      table
        .string('etapeStatutId', 3)
        .index()
        .references('etapesStatuts.id')
        .notNullable()
      table.integer('ordre')
      table.primary(['etapeTypeId', 'etapeStatutId'])
    })
    .createTable('documentsTypes', table => {
      table.string('id', 3).primary()
      table.string('nom').notNullable()
      table.text('description')
    })
    .createTable('etapesTypes__documentsTypes', table => {
      table
        .string('etapeTypeId', 3)
        .index()
        .references('etapesTypes.id')
        .notNullable()
        .onDelete('CASCADE')
      table
        .string('documentTypeId', 3)
        .index()
        .references('documentsTypes.id')
        .notNullable()
      table.boolean('optionnel')
      table.text('description')
      table.primary(['etapeTypeId', 'documentTypeId'])
    })
    .createTable(
      'titresTypes__demarchesTypes__etapesTypes__documentsTypes',
      table => {
        table.string('titreTypeId', 3).index().notNullable()
        table.string('demarcheTypeId', 7).index().notNullable()
        table.string('etapeTypeId', 3).index().notNullable()
        table
          .string('documentTypeId', 3)
          .index()
          .references('documentsTypes.id')
          .notNullable()
        table.boolean('optionnel')
        table.text('description')
        table.primary([
          'titreTypeId',
          'demarcheTypeId',
          'etapeTypeId',
          'documentTypeId'
        ])
        table
          .foreign(['titreTypeId', 'demarcheTypeId', 'etapeTypeId'])
          .references(['titreTypeId', 'demarcheTypeId', 'etapeTypeId'])
          .inTable('titresTypes__demarchesTypes__etapesTypes')
      }
    )
    .createTable(
      'titresTypes__demarchesTypes__etapesTypes__justificatifsT',
      table => {
        table.string('titreTypeId', 3).index().notNullable()
        table.string('demarcheTypeId', 7).index().notNullable()
        table.string('etapeTypeId', 3).index().notNullable()
        table
          .string('documentTypeId', 3)
          .index()
          .references('documentsTypes.id')
          .notNullable()
        table.boolean('optionnel')
        table.text('description')
        table.primary([
          'titreTypeId',
          'demarcheTypeId',
          'etapeTypeId',
          'documentTypeId'
        ])
        table
          .foreign(['titreTypeId', 'demarcheTypeId', 'etapeTypeId'])
          .references(['titreTypeId', 'demarcheTypeId', 'etapeTypeId'])
          .inTable('titresTypes__demarchesTypes__etapesTypes')
      }
    )
}

exports.down = knex => {
  return knex.schema
    .dropTable('titresTypes__demarchesTypes__etapesTypes__justificatifsT')
    .dropTable('titresTypes__demarchesTypes__etapesTypes__documentsTypes')
    .dropTable('etapesTypes__documentsTypes')
    .dropTable('etapesTypes__etapesStatuts')
    .dropTable('etapesStatuts')
    .dropTable('titresTypes__demarchesTypes__etapesTypes')
    .dropTable('etapesTypes')
    .dropTable('demarchesStatuts')
    .dropTable('titresTypes__demarchesTypes')
    .dropTable('demarchesTypes')
    .dropTable('phasesStatuts')
    .dropTable('documentsTypes')
}
