exports.up = async knex => {
  await knex.schema.alterTable('titresDemarches', function (table) {
    table.dropForeign('statutId')
  })

  return knex.schema.dropTable('demarchesStatuts')
}

exports.down = () => ({})
