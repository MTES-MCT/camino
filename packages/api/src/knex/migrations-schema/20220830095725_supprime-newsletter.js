exports.up = knex =>
  knex.schema.alterTable('utilisateurs', table => {
    table.dropColumn('newsletter')
  })

exports.down = () => ({})
