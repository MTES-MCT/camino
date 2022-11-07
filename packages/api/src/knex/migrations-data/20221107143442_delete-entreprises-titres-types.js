exports.up = async knex => {
  await knex.schema.dropTable('entreprises__titresTypes')
}

exports.down = () => ({})
