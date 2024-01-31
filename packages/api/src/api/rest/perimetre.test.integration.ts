import { userSuper } from '../../database/user-super.js'
import { dbManager } from '../../../tests/db-manager.js'
import { restPostCall } from '../../../tests/_utils/index.js'
import { test, expect, vi, beforeAll, afterAll, describe } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { FeatureCollection, FeatureMultiPolygon, featureMultiPolygonValidator, GeojsonImportBody } from 'camino-common/src/perimetre.js'
import { GEO_SYSTEME_IDS, TransformableGeoSystemeId, transformableGeoSystemeIds } from 'camino-common/src/static/geoSystemes.js'
import { idGenerate } from '../../database/models/_format/id-create.js'
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { tempDocumentNameValidator } from 'camino-common/src/document.js'
import { titreSlugValidator } from 'camino-common/src/validators/titres.js'
import { dirname, join } from 'node:path'

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
      titreSlug: titreSlugValidator.parse('titre-slug'),
      titreTypeId: 'arm',
      tempDocumentName: tempDocumentNameValidator.parse(fileName),
      fileType: 'geojson',
    }

    const tested = await restPostCall(dbPool, '/rest/geojson/import/:geoSystemeId', { geoSystemeId: GEO_SYSTEME_IDS.WGS84 }, userSuper, body)
    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  })

  test('fichier valide', async () => {
    const feature: FeatureCollection = {
      type: 'FeatureCollection',
      features: [value, { type: 'Feature', geometry: { type: 'Point', coordinates: [-52.54, 4.22269896902571] }, properties: { nom: 'A', description: 'Une description du point A' } }],
    }
    const fileName = `existing_temp_file_${idGenerate()}.geojson`
    mkdirSync(dir, { recursive: true })
    writeFileSync(`${dir}/${fileName}`, JSON.stringify(feature))
    const body: GeojsonImportBody = {
      titreSlug: titreSlugValidator.parse('titre-slug'),
      titreTypeId: 'arm',
      tempDocumentName: tempDocumentNameValidator.parse(fileName),
      fileType: 'geojson',
    }

    const tested = await restPostCall(dbPool, '/rest/geojson/import/:geoSystemeId', { geoSystemeId: GEO_SYSTEME_IDS.WGS84 }, userSuper, body)
    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
    expect(tested.body).toMatchInlineSnapshot(`
      {
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
        "superposition_alertes": [],
        "surface": 1.03,
      }
    `)
  })

  test('geojson geometrie non valide', async () => {
    const feature: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},

          geometry: {
            type: 'MultiPolygon',
            coordinates: [[[[-52.54, 4.22269896902571]]]],
          },
        },
      ],
    }
    const fileName = `existing_temp_file_${idGenerate()}.geojson`
    mkdirSync(dir, { recursive: true })
    writeFileSync(`${dir}/${fileName}`, JSON.stringify(feature))
    const body: GeojsonImportBody = {
      titreSlug: titreSlugValidator.parse('mfr'),
      titreTypeId: 'arm',
      tempDocumentName: tempDocumentNameValidator.parse(fileName),
      fileType: 'geojson',
    }

    const tested = await restPostCall(dbPool, '/rest/geojson/import/:geoSystemeId', { geoSystemeId: GEO_SYSTEME_IDS.WGS84 }, userSuper, body)
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

  test('shape MultiPolygon', async () => {

    const fileName = `existing_temp_file_${idGenerate()}.shp`
    mkdirSync(dir, { recursive: true })
    copyFileSync(  join(__dirname, 'perimetre-multipolygon.shp'), `${dir}/${fileName}`)
    const body: GeojsonImportBody = {
      titreSlug: titreSlugValidator.parse('mfr'),
      titreTypeId: 'arm',
      tempDocumentName: tempDocumentNameValidator.parse(fileName),
      fileType: 'shp',
    }

    const tested = await restPostCall(dbPool, '/rest/geojson/import/:geoSystemeId', { geoSystemeId: GEO_SYSTEME_IDS.WGS84 }, userSuper, body)
    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "communes": [],
        "foretIds": [],
        "geojson4326_perimetre": {
          "geometry": {
            "coordinates": [
              [
                [
                  [
                    -53.81653184297778,
                    4.8383872290879895,
                  ],
                  [
                    -53.81322738755286,
                    4.830006672894745,
                  ],
                  [
                    -53.821573012562965,
                    4.826728136167801,
                  ],
                  [
                    -53.824850522367235,
                    4.83511774986356,
                  ],
                  [
                    -53.81653184297778,
                    4.8383872290879895,
                  ],
                ],
              ],
              [
                [
                  [
                    -53.81404550326657,
                    4.827437097386464,
                  ],
                  [
                    -53.81077723268214,
                    4.819056328722645,
                  ],
                  [
                    -53.81913190272549,
                    4.81580496237806,
                  ],
                  [
                    -53.82241815394935,
                    4.824167494311766,
                  ],
                  [
                    -53.81404550326657,
                    4.827437097386464,
                  ],
                ],
              ],
            ],
            "type": "MultiPolygon",
          },
          "properties": {},
          "type": "Feature",
        },
        "geojson4326_points": null,
        "sdomZoneIds": [],
        "secteurMaritimeIds": [],
        "superposition_alertes": [],
        "surface": 1.98,
      }
    `)
  })

  test('shape Polygon', async () => {

    const fileName = `existing_temp_file_${idGenerate()}.shp`
    mkdirSync(dir, { recursive: true })
    copyFileSync(  join(__dirname, 'perimetre-polygon.shp'), `${dir}/${fileName}`)
    const body: GeojsonImportBody = {
      titreSlug: titreSlugValidator.parse('mfr'),
      titreTypeId: 'arm',
      tempDocumentName: tempDocumentNameValidator.parse(fileName),
      fileType: 'shp',
    }

    const tested = await restPostCall(dbPool, '/rest/geojson/import/:geoSystemeId', { geoSystemeId: GEO_SYSTEME_IDS.WGS84 }, userSuper, body)
    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "communes": [],
        "foretIds": [],
        "geojson4326_perimetre": {
          "geometry": {
            "coordinates": [
              [
                [
                  [
                    -0.559793682920957,
                    48.69765481906163,
                  ],
                  [
                    -0.50310099913386,
                    48.66913554685156,
                  ],
                  [
                    -0.503048663319543,
                    48.66913708570969,
                  ],
                  [
                    -0.463219575114003,
                    48.64222035907392,
                  ],
                  [
                    -0.48911285307621105,
                    48.63372706181441,
                  ],
                  [
                    -0.504861007120728,
                    48.632407377355996,
                  ],
                  [
                    -0.520477872758127,
                    48.63260449428472,
                  ],
                  [
                    -0.551973282810394,
                    48.664914859247844,
                  ],
                  [
                    -0.567779909973754,
                    48.6727797057878,
                  ],
                  [
                    -0.565098757717653,
                    48.68851259991904,
                  ],
                  [
                    -0.559793682920957,
                    48.69765481906163,
                  ],
                ],
              ],
            ],
            "type": "MultiPolygon",
          },
          "properties": {},
          "type": "Feature",
        },
        "geojson4326_points": null,
        "sdomZoneIds": [],
        "secteurMaritimeIds": [],
        "superposition_alertes": [],
        "surface": 24.77,
      }
    `)
  })
})
