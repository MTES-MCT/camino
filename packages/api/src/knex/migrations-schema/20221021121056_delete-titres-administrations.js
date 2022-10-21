exports.up = async knex => {
  await knex.schema.dropTable('titresAdministrationsLocales')

  await knex.schema.alterTable('titres_etapes', function (table) {
    table.jsonb('administrations_locales').index()
  })

  return knex.schema.dropTable('titresAdministrations')
}

exports.down = () => ({})
