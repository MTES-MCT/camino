exports.up = knex =>
  knex.schema.createTable('titres__titres', table => {
    table.string('titreFromId').notNullable().index()
    table.string('titreToId').notNullable().index()
    table.foreign('titreFromId').references('titres.id')
    table.foreign('titreToId').references('titres.id')
    table.primary(['titreFromId', 'titreToId'])
  })

exports.down = () => ({})
