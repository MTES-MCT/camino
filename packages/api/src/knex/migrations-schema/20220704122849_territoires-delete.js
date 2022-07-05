exports.up = async knex => {
  await knex.schema.alterTable('activitesTypes__pays', function (table) {
    table.dropIndex('pays_id', 'activitestypes__pays_paysid_index')
    table.dropForeign('pays_id', 'activitestypes__pays_paysid_foreign')
  })

  await knex.schema.alterTable('communes', function (table) {
    table.dropIndex('departement_id', 'communes_departementid_index')
    table.dropForeign('departement_id', 'communes_departementid_foreign')
  })

  await knex.schema.alterTable('administrations', function (table) {
    table.dropForeign('departement_id', 'administrations_departementid_foreign')
    table.dropForeign('region_id', 'administrations_regionid_foreign')
  })

  await knex.schema.dropTable('departements')
  await knex.schema.dropTable('regions')

  return knex.schema.dropTable('pays')
}

exports.down = () => ({})
