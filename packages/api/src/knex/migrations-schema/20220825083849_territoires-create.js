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
}
