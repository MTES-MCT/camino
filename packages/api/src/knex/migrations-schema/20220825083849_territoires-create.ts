import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.raw('alter table communes ADD COLUMN geometry geometry(Multipolygon,4326)')
  await knex.raw('alter table forets ADD COLUMN geometry geometry(Multipolygon,4326)')
  await knex.raw('alter table sdom_zones ADD COLUMN geometry geometry(Multipolygon,4326)')

  await knex.raw('CREATE INDEX index_geo_communes on communes using spgist (geometry)')
  await knex.raw('CREATE INDEX index_geo_forets on forets using spgist (geometry)')
  await knex.raw('CREATE INDEX index_geo_sdom_zones on sdom_zones using spgist (geometry)')

  await knex.schema.alterTable('titres_forets', table => {
    table.dropColumn('surface')
  })

  await knex.schema.alterTable('titres__sdom_zones', table => {
    table.dropColumn('surface')
  })
}

export const down = () => ({})
