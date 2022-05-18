exports.up = async knex => {
  return knex.schema.dropTable('geo_systemes')
}

exports.down = () => ({})
