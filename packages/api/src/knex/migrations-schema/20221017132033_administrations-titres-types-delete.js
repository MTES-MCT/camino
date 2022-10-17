exports.up = async knex => knex.schema.dropTable('administrations__titresTypes')

exports.down = () => ({})
