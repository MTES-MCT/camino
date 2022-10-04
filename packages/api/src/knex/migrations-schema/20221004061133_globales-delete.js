exports.up = knex => knex.schema.dropTable('globales')

exports.down = () => ({})
