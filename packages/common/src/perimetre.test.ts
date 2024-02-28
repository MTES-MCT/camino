import { test, expect } from 'vitest'
import { crsUrnValidator, equalGeojson } from './perimetre'

test('equalGeojson', () => {
  expect(equalGeojson({ type: 'MultiPolygon', coordinates: [[[[1, 2]]]] }, null)).toBe(false)
  expect(equalGeojson({ type: 'MultiPolygon', coordinates: [[[[1, 2]]]] }, undefined)).toBe(false)
  expect(equalGeojson({ type: 'MultiPolygon', coordinates: [[[[1, 2]]]] }, { type: 'MultiPolygon', coordinates: [[[[2, 2]]]] })).toBe(false)
  expect(
    equalGeojson(
      { type: 'MultiPolygon', coordinates: [[[[1, 2]]]] },
      {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [2, 2],
              [1, 2],
            ],
          ],
        ],
      }
    )
  ).toBe(false)
  expect(
    equalGeojson(
      {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [1, 2],
              [1, 2],
            ],
          ],
        ],
      },
      { type: 'MultiPolygon', coordinates: [[[[1, 2]]]] }
    )
  ).toBe(false)
  expect(equalGeojson({ type: 'MultiPolygon', coordinates: [[[[1, 2]]]] }, { type: 'MultiPolygon', coordinates: [[[[1, 2]]]] })).toBe(true)
})

test('crsUrnValidator', () => {
  expect(crsUrnValidator.safeParse('').success).toBe(false)
  expect(crsUrnValidator.safeParse('urn:ogc:def:crs:EPSG::2972').success).toBe(true)
  expect(crsUrnValidator.safeParse('urn:ogc:def:crs:EPSG:1.32:2972').success).toBe(true)
  expect(crsUrnValidator.safeParse('urn:ogc:def:crs:EPSG::PLOP').success).toBe(false)
  expect(crsUrnValidator.safeParse('urn:ogc:def:crs:EPSG::').success).toBe(false)
})
