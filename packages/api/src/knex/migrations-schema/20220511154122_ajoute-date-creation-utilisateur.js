exports.up = async knex => {
  await knex.schema.alterTable('utilisateurs', function (table) {
    table.string('dateCreation')
  })

  await knex('utilisateurs').update({ dateCreation: '1970-01-01' })

  await knex.schema.alterTable('utilisateurs', function (table) {
    table.dropNullable('dateCreation')
  })
}

exports.down = () => ({})
