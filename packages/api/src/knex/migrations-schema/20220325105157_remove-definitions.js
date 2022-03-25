exports.up = knex => knex.schema.dropTable('definitions')

exports.down = () => ({})
