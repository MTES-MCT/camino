exports.up = async knex => {
  await knex.schema.alterTable('utilisateurs', function (table) {
    table.dropIndex('permission_id', 'utilisateurs_permissionid_index')
    table.dropForeign('permission_id', 'utilisateurs_permissionid_foreign')
  })
  await knex.schema.table('utilisateurs', table => {
    table.renameColumn('permission_id', 'role')
  })

  await knex.schema.alterTable('utilisateurs', function (t) {
    t.string('role', 255).notNullable().alter()
  })

  return knex.schema.dropTable('permissions')
}

exports.down = () => ({})
