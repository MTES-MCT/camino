exports.up = knex =>
  knex.schema.alterTable('utilisateurs', function (table) {
    table.string('qgis_token').index()
  })

exports.down = () => ({})
