exports.up = async knex => {
  return knex.schema.dropTable('titres_administrations_gestionnaires')
}

exports.down = () => ({})
