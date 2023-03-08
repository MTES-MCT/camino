import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.raw('alter table communes DROP COLUMN geometry')
  await knex.raw('alter table forets DROP COLUMN geometry')
  await knex.raw('alter table sdom_zones DROP COLUMN geometry')

  await knex.raw(
    `create table communes_postgis(
            id varchar(5) primary key,
            geometry geometry(Multipolygon,4326)
        )`
  )
  await knex.raw(
    `create table forets_postgis(
            id varchar(30) primary key,
            geometry geometry(Multipolygon,4326)
            )`
  )

  await knex.raw(
    `create table sdom_zones_postgis(
            id varchar(30) primary key,
            geometry geometry(Multipolygon,4326)
            )`
  )

  await knex.raw('CREATE INDEX index_geo_communes on communes_postgis using spgist (geometry)')
  await knex.raw('CREATE INDEX index_geo_forets on forets_postgis using spgist (geometry)')
  await knex.raw('CREATE INDEX index_geo_sdom_zones on sdom_zones_postgis using spgist (geometry)')
}
export const down = () => ({})
