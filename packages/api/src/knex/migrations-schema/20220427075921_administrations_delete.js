exports.up = async knex => {
  await knex.schema.table('administrations', table => {
    table.dropColumn('type_id')
    table.dropColumn('nom')
    table.dropColumn('abreviation')
    table.dropColumn('service')
    table.dropColumn('url')
    table.dropColumn('email')
    table.dropColumn('telephone')
    table.dropColumn('adresse1')
    table.dropColumn('adresse2')
    table.dropColumn('code_postal')
    table.dropColumn('commune')
    table.dropColumn('cedex')
  })

  await knex.schema.table('administrations', table => {
    table.string('type_id').index().notNullable()
  })

  return knex.schema.dropTable('administrations_types')
}

exports.down = () => ({})
