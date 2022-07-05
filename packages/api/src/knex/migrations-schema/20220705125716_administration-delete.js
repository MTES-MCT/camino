exports.up = knex =>
  knex.schema.alterTable('administrations', function (table) {
    table.dropColumns('departement_id', 'region_id', 'type_id')
  })

exports.down = () => ({})
