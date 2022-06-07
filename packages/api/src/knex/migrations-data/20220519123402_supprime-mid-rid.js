exports.up = async knex => {
  const etapeTypeIds = ['mid', 'rid']

  await knex('administrations__titresTypes__etapesTypes')
    .whereIn('etapeTypeId', etapeTypeIds)
    .delete()
  await knex('etapesTypes__etapesStatuts')
    .whereIn('etapeTypeId', etapeTypeIds)
    .delete()
  await knex('titresTypes__demarchesTypes__etapesTypes')
    .whereIn('etapeTypeId', etapeTypeIds)
    .delete()
  await knex('etapesTypes').whereIn('id', etapeTypeIds).delete()
}

exports.down = () => ({})
