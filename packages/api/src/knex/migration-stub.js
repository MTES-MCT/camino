exports.up = async knex => {
  await knex.schema.dropTable('nexistepasEtVaFairePlanterLaMigration')

  return knex.schema.dropTable('nexistepasEtVaFairePlanterLaMigration')
}

exports.down = () => ({})
