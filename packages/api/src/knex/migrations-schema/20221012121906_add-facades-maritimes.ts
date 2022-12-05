import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.createTable('secteurs_maritime', table => {
    table.integer('id').primary()
    table.string('nom')
    table.string('facade')
  })

  await knex.raw(
    `create table secteurs_maritime_postgis(
        id integer primary key,
        geometry geometry(MultiPolygon,4326),
        FOREIGN KEY (id)
          REFERENCES secteurs_maritime (id)
      )`
  )

  await knex.raw(
    'CREATE INDEX index_geo_secteurs_maritime on secteurs_maritime_postgis using spgist (geometry)'
  )

  await knex.schema.createTable('titres__secteurs_maritime', table => {
    table.string('titre_etape_id', 128).notNullable().index()
    table
      .foreign('titre_etape_id')
      .references('titres_etapes.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
    table
      .integer('secteur_maritime_id')
      .notNullable()
      .index()
      .references('secteurs_maritime.id')
    table.primary(['titre_etape_id', 'secteur_maritime_id'])
  })
}

export const down = () => ({})
