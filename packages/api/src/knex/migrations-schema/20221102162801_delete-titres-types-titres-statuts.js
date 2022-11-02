exports.up = async knex => {
  await knex.schema.dropTable('titres_types__titres_statuts')
}

exports.down = () => ({})
