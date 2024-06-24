import { EtapeId } from 'camino-common/src/etape'
import { MultiPolygon } from 'camino-common/src/perimetre'
import { Knex } from 'knex'
import { M2, km2Validator } from 'camino-common/src/number.js'

export const up = async (knex: Knex) => {
  const { rows: etapes }: { rows: { id: EtapeId; geojson4326_perimetre: MultiPolygon }[] } = await knex.raw(
    'SELECT e.id, ST_AsGeoJSON (e.geojson4326_perimetre, 40)::json as geojson4326_perimetre FROM titres_etapes e WHERE e.surface IS NULL AND e.geojson4326_perimetre IS NOT NULL'
  )

  for (let i = 0; i < etapes.length; i++) {
    const { rows }: { rows: { surface: M2 }[] } = await knex.raw('SELECT ST_AREA (ST_MAKEVALID (ST_GeomFromGeoJSON (?)), true) as surface', [etapes[i].geojson4326_perimetre])

    const surface = km2Validator.parse(Number.parseFloat((rows[0].surface / 1_000_000).toFixed(2)))
    await knex.raw('UPDATE titres_etapes SET surface = ? WHERE id = ?', [surface, etapes[i].id])
  }
}

export const down = () => ({})
