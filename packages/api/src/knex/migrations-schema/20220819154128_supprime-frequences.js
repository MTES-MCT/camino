exports.up = async knex => {
  await knex.schema.alterTable('activites_types', function (table) {
    table.dropForeign('frequence_id', 'activitestypes_frequenceid_foreign')
  })

  await knex.schema.dropTable('annees')
  await knex.schema.dropTable('mois')
  await knex.schema.dropTable('trimestres')

  return knex.schema.dropTable('frequences')
}

exports.down = () => ({})
