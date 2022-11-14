exports.up = async knex => {
  // colonnes qui servent à rien dans la table etapes_types :
  // - parent_id
  // - legal_ref
  // - legal_lien
  // - date_debut
  await knex.schema.alterTable('etapes_types', function (table) {
    table.dropColumn('parent_id')
    table.dropColumn('legal_ref')
    table.dropColumn('legal_lien')
    table.dropColumn('date_debut')
  })
}

exports.down = () => ({})
