exports.up = async knex => {
  await knex.schema.table('activitesTypes', table => {
    table.dropColumn('satisfactionUrl')
  })
}

exports.down = () => ({})
