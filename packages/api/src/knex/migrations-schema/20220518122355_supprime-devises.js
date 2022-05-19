exports.up = async knex => {
  await knex.schema.dropTable('devises')
}

exports.down = () => ({})
