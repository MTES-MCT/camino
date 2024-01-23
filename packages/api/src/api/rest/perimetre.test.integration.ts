import { userSuper } from '../../database/user-super.js'
import { dbManager } from '../../../tests/db-manager.js'
import { restPostCall } from '../../../tests/_utils/index.js'
import { test, expect, vi, beforeAll, afterAll, describe } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { FeatureCollection, FeatureMultiPolygon, featureMultiPolygonValidator } from 'camino-common/src/perimetre.js'
import { GEO_SYSTEME_IDS, TransformableGeoSystemeId, transformableGeoSystemeIds } from 'camino-common/src/static/geoSystemes.js'
import { GeojsonImportBody } from 'camino-common/src/perimetre.js'
import { idGenerate } from '../../database/models/_format/id-create.js'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tempDocumentNameValidator } from 'camino-common/src/document.js'

console.info = vi.fn()
console.error = vi.fn()

let dbPool: Pool

beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool
})

afterAll(async () => {
  await dbManager.closeKnex()
})

const value: FeatureMultiPolygon = {
  type: 'Feature',
  properties: {},

  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [-52.54, 4.22269896902571],
          [-52.55, 4.22438936251509],
          [-52.55, 4.24113309117193],
          [-52.54, 4.22269896902571],
        ],
      ],
    ],
  },
}

describe('getGeojsonByGeoSystemeId', () => {
  test('pas de conversion 4326', async () => {
    const tested = await restPostCall(dbPool, '/rest/geojson/:geoSystemeId', { geoSystemeId: '4326' }, userSuper, featureMultiPolygonValidator.parse(value))

    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
    expect(tested.body).toStrictEqual(value)
  })

  test('toutes les conversions', async () => {
    const result: { [key in TransformableGeoSystemeId]?: unknown } = {}
    for (const geoSysteme of transformableGeoSystemeIds) {
      const tested = await restPostCall(dbPool, '/rest/geojson/:geoSystemeId', { geoSystemeId: geoSysteme }, userSuper, featureMultiPolygonValidator.parse(value))

      expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
      result[geoSysteme] = tested.body
    }

    expect(result).toMatchSnapshot()
  })
})

const dir = `${process.cwd()}/files/tmp/`
describe('geojsonImport', () => {
  test('fichier invalide', async () => {

    const fileName = `existing_temp_file_${idGenerate()}.geojson`
      mkdirSync(dir, { recursive: true })
      writeFileSync(`${dir}/${fileName}`, 'Hey there!')
    const body: GeojsonImportBody = {
      etapeTypeId: 'mfr',
      titreTypeId: 'arm',
      tempDocumentName: tempDocumentNameValidator.parse(fileName)
    }
    
    const tested = await restPostCall(dbPool, '/rest/geojson/import/:geosystemeId', { geosystemeId: GEO_SYSTEME_IDS.WGS84 }, userSuper, body)
    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  })


  test('fichier valide', async () => {
    const feature: FeatureCollection = {type: 'FeatureCollection', features: [value, {type: 'Feature', geometry: {type: 'Point', coordinates: [-52.54, 4.22269896902571]}, properties: {nom: 'A', description: 'Une description du point A'}}]}
    const fileName = `existing_temp_file_${idGenerate()}.geojson`
      mkdirSync(dir, { recursive: true })
      writeFileSync(`${dir}/${fileName}`, JSON.stringify(feature))
    const body: GeojsonImportBody = {
      etapeTypeId: 'mfr',
      titreTypeId: 'arm',
      tempDocumentName: tempDocumentNameValidator.parse(fileName)
    }
    
    const tested = await restPostCall(dbPool, '/rest/geojson/import/:geosystemeId', { geosystemeId: GEO_SYSTEME_IDS.WGS84 }, userSuper, body)
    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "alertes": [],
        "communes": [],
        "foretIds": [],
        "geojson4326_perimetre": {
          "geometry": {
            "coordinates": [
              [
                [
                  [
                    -52.54,
                    4.22269896902571,
                  ],
                  [
                    -52.55,
                    4.22438936251509,
                  ],
                  [
                    -52.55,
                    4.24113309117193,
                  ],
                  [
                    -52.54,
                    4.22269896902571,
                  ],
                ],
              ],
            ],
            "type": "MultiPolygon",
          },
          "properties": {},
          "type": "Feature",
        },
        "geojson4326_points": {
          "features": [
            {
              "geometry": {
                "coordinates": [
                  -52.54,
                  4.22269896902571,
                ],
                "type": "Point",
              },
              "properties": {
                "description": "Une description du point A",
                "nom": "A",
              },
              "type": "Feature",
            },
          ],
          "type": "FeatureCollection",
        },
        "sdomZoneIds": [],
        "secteurMaritimeIds": [],
        "surface": 0.00008371864328418188,
      }
    `)
  })

  test('geojson geometrie non valide', async () => {
    const feature: FeatureCollection = {type: 'FeatureCollection', features: [{
      type: 'Feature',
      properties: {},
    
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [-52.54, 4.22269896902571],
            ],
          ],
        ],
      },
    }]}
    const fileName = `existing_temp_file_${idGenerate()}.geojson`
      mkdirSync(dir, { recursive: true })
      writeFileSync(`${dir}/${fileName}`, JSON.stringify(feature))
    const body: GeojsonImportBody = {
      etapeTypeId: 'mfr',
      titreTypeId: 'arm',
      tempDocumentName: tempDocumentNameValidator.parse(fileName)
    }
    
    const tested = await restPostCall(dbPool, '/rest/geojson/import/:geosystemeId', { geosystemeId: GEO_SYSTEME_IDS.WGS84 }, userSuper, body)
    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "issues": [
          {
            "code": "too_small",
            "exact": false,
            "inclusive": true,
            "message": "Array must contain at least 3 element(s)",
            "minimum": 3,
            "path": [
              "features",
              0,
              "geometry",
              "coordinates",
              0,
              0,
            ],
            "type": "array",
          },
        ],
        "name": "ZodError",
      }
    `)
  })
})

