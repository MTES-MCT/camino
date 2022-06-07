exports.up = async knex => {
  return knex.schema.dropTable('unites')
}

exports.down = () => ({})
