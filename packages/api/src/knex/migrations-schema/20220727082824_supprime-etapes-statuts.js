exports.up = async knex => {
  await knex.schema.alterTable('titres_etapes', function (table) {
    table.dropForeign('statut_id', 'titresetapes_statutid_foreign')
  })
  await knex.schema.dropTable('etapes_types__etapes_statuts')
  await knex.schema.dropTable('etapes_statuts')
}

exports.down = () => ({})
