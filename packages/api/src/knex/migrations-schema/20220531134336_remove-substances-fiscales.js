exports.up = async knex => {
  await knex.schema.dropTable('substancesFiscales')
}

exports.down = () => ({})
