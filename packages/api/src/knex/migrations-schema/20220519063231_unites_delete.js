exports.up = async knex => {
  await knex.schema.table('substancesFiscales', table => {
    table.dropForeign('uniteId')
    table.dropForeign('redevanceUniteId')
  })

  return knex.schema.dropTable('unites')
}

exports.down = () => ({})
