exports.up = async knex => {
  await knex.schema.alterTable('secteurs_maritime_postgis', function (table) {
    table.dropForeign('id', 'secteurs_maritime_postgis_id_fkey')
  })
  await knex.schema.dropTable('titres__secteurs_maritime')
  await knex.schema.dropTable('secteurs_maritime')

  await knex.schema.alterTable('titres_etapes', function (table) {
    table.jsonb('secteurs_maritime').index()
  })
}

exports.down = () => ({})
