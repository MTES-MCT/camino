exports.up = async knex => {
  await knex.schema.alterTable('titres_substances', function (table) {
    table.dropForeign('substance_id', 'titressubstances_substanceid_foreign')
    table.integer('ordre').notNullable().alter()
  })

  await knex.raw('DROP INDEX titre_etape_id_unique')
  await knex.raw('DROP INDEX titre_etape_id_ordre_unique')
  await knex.raw(
    'CREATE UNIQUE INDEX titre_etape_id_ordre_unique on titres_substances(titre_etape_id, ordre)'
  )

  await knex.schema.dropTable('substances__substances_legales')
  await knex.schema.dropTable('substances_legales')
  await knex.schema.dropTable('substances')

  await knex('titres_substances')
    .where('substance_id', 'suco')
    .update({ substance_id: 'scoc' })

  await knex('titres_substances')
    .where('substance_id', 'scor')
    .update({ substance_id: 'scoc' })

  await knex('titres_substances')
    .where('substance_id', 'bitm')
    .update({ substance_id: 'hydm' })
}

exports.down = () => ({})
