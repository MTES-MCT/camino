/* eslint-disable sql/no-unsafe-query */
import { Knex } from 'knex'
import { EtapeId } from 'camino-common/src/etape.js'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools.js'
import { FeatureMultiPolygon } from 'camino-common/src/perimetre.js'
import { TitreId } from 'camino-common/src/validators/titres'

const etapesToNotMigrate = ['0NmsqYGVQJYKhFY22Ltt4NBV']

interface IGeoJson {
  type: string
  geometry?: NonNullable<unknown> | null
  bbox?: number[] | null
  properties: NonNullable<unknown> | null
  features?: IGeoJson[] | null
}

const geojsonFeatureMultiPolygon = (_points: any[]): FeatureMultiPolygon => {
  throw new Error('Migration obsolète suite à la suppression de geojson-rewind du projet')
}

// convertit des points
// en un geojson de type 'FeatureCollection' de 'Points'
const geojsonFeatureCollectionPoints = (points: any[]): IGeoJson | null => {
  if (points.some(({ nom, description }) => (isNotNullNorUndefined(nom) && nom !== '') || (isNotNullNorUndefined(description) && description !== ''))) {
    return {
      type: 'FeatureCollection',
      properties: {},
      features: points.map(p => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [p.coordonnees.x, p.coordonnees.y],
        },
        properties: {
          nom: p.nom,
          description: p.description,
        },
      })),
    }
  }

  return null
}

export const up = async (knex: Knex) => {
  await knex.raw('alter table titres_etapes add column geojson4326_perimetre public.geometry(MultiPolygon,4326)')
  await knex.raw('alter table titres_etapes add column geojson4326_points JSONB')
  await knex.raw('CREATE INDEX titres_etapes_geom_idx  ON titres_etapes USING GIST (geojson4326_perimetre)')

  await knex.raw(
    'CREATE TABLE perimetre_reference (titre_etape_id character varying(255) NOT NULL, geo_systeme character varying(255) NOT NULL, opposable boolean default false, geojson_perimetre JSONB)'
  )
  await knex.raw('ALTER TABLE perimetre_reference ADD CONSTRAINT perimetre_reference_pk PRIMARY KEY (titre_etape_id, geo_systeme)')
  await knex.raw('ALTER TABLE perimetre_reference ADD CONSTRAINT perimetre_reference_titre_etape_fk FOREIGN KEY (titre_etape_id) REFERENCES titres_etapes(id)')

  const etapes: { rows: { id: EtapeId; heritage_props: { points?: any; surface?: any; perimetre?: any } | null }[] } = await knex.raw('select * from titres_etapes')

  for (const etape of etapes.rows) {
    if (!etapesToNotMigrate.includes(etape.id)) {
      const points: { rows: any[] } = await knex.raw('select * from titres_points where titre_etape_id = ? order by groupe, contour, point', [etape.id])

      if (isNotNullNorUndefinedNorEmpty(points.rows)) {
        const geojsonPoints = geojsonFeatureCollectionPoints(points.rows)

        if (geojsonPoints !== null) {
          await knex.raw(
            `update titres_etapes set geojson4326_perimetre = ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(
              geojsonFeatureMultiPolygon(points.rows).geometry
            )}'), 4326), geojson4326_points = ?::jsonb where id = ?`,
            [JSON.stringify(geojsonPoints), etape.id]
          )
        } else {
          await knex.raw(`update titres_etapes set geojson4326_perimetre = ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(geojsonFeatureMultiPolygon(points.rows).geometry)}'), 4326) where id = ?`, [
            etape.id,
          ])
        }
      }
    }

    if (isNotNullNorUndefined(etape.heritage_props)) {
      delete etape.heritage_props.surface

      if ('points' in etape.heritage_props) {
        etape.heritage_props.perimetre = etape.heritage_props.points
        delete etape.heritage_props.points
      }

      await knex.raw(`update titres_etapes set heritage_props = ? where id = ?`, [etape.heritage_props, etape.id])
    }
  }

  const titres: { rows: { id: TitreId; props_titre_etapes_ids: { surface: any } | null }[] } = await knex.raw('select * from titres')
  for (const titre of titres.rows) {
    if (isNotNullNorUndefined(titre.props_titre_etapes_ids)) {
      delete titre.props_titre_etapes_ids.surface

      await knex.raw(`update titres set props_titre_etapes_ids = ? where id = ?`, [titre.props_titre_etapes_ids, titre.id])
    }
  }

  await knex.raw('alter table titres drop column coordonnees')
  await knex.raw('drop table titres_points_references')
  await knex.raw('drop table titres_points')
}

export const down = () => ({})
