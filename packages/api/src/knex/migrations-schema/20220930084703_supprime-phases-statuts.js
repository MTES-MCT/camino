exports.up = async knex => {
  await knex.schema.alterTable('titres_phases', function (table) {
    table.dropForeign('statut_id', 'titresphases_statutid_foreign')
  })
  await knex.schema.alterTable('titres_phases', function (table) {
    table.renameColumn('statut_id', 'phase_statut_id')
  })

  await knex.schema.dropTable('phases_statuts')
}

exports.down = () => ({})
