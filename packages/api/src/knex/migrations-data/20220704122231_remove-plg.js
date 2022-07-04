exports.up = async knex => {
  await knex('etapesTypes__documentsTypes')
    .where('documentTypeId', 'plg')
    .delete()
  await knex('documentsTypes').where('id', 'plg').delete()
}

exports.down = () => ({})
