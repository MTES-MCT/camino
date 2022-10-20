exports.up = async knex => {
  await knex.schema.alterTable('secteurs_maritime_postgis', function (table) {
    table.dropForeign('id', 'secteurs_maritime_postgis_id_fkey')
  })
  await knex.schema.dropTable('titres__secteurs_maritime')
  await knex.schema.dropTable('secteurs_maritime')
}

exports.down = () => ({})
