import { userSuper } from '../../database/user-super.js'
import { dbManager } from '../../../tests/db-manager.js'
import { restPostCall } from '../../../tests/_utils/index.js'
import { test, expect, vi, beforeAll, afterAll, describe } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { FeatureMultiPolygon, featureMultiPolygonValidator } from 'camino-common/src/demarche.js'
import { TransformableGeoSystemeId, transformableGeoSystemeIds } from 'camino-common/src/static/geoSystemes.js'

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
  properties: null,

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
