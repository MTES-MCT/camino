exports.up = async knex => {
  await knex.raw(
    'alter table communes ADD COLUMN geometry geometry(Multipolygon,4326)'
  )
  await knex.raw(
    'alter table forets ADD COLUMN geometry geometry(Multipolygon,4326)'
  )
  await knex.raw(
    'alter table sdom_zones ADD COLUMN geometry geometry(Multipolygon,4326)'
  )

  await knex.schema.alterTable('titres_forets', table => {
    table.dropColumn('surface')
  })

  await knex.schema.alterTable('titres__sdom_zones', table => {
    table.dropColumn('surface')
  })
}

exports.down = () => ({})
