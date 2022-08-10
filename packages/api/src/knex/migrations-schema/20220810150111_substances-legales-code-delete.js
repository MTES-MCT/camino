exports.up = async knex => {
  await knex.schema.alterTable('substancesLegales', function (table) {
    table.dropColumn('substanceLegaleCodeId')
  })

  return knex.schema.dropTable('substancesLegalesCodes')
}

exports.down = () => ({})
