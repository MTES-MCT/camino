exports.up = async knex => {
  await knex.schema.alterTable('titres_substances', function (table) {
    table.dropForeign('substance_id', 'titressubstances_substanceid_foreign')
  })

  await knex('titres_substances')
    .where('substance_id', 'suco')
    .update({ substance_id: 'scoc' })

  await knex('titres_substances')
    .where('substance_id', 'scor')
    .update({ substance_id: 'scoc' })

  await knex('titres_substances')
    .where('substance_id', 'bitm')
    .update({ substance_id: 'hydm' })

  await knex.schema.dropTable('substances__substances_legales')
  await knex.schema.dropTable('substances_legales')
  await knex.schema.dropTable('substances')
}

exports.down = () => ({})
