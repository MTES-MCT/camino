import { test, expect } from 'vitest'
import { crsUrnValidator, equalGeojson, featureForagePropertiesValidator } from './perimetre'
import { z } from 'zod'

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
  expect(crsUrnValidator.safeParse('urn:ogc:def:crs:OGC::CRS84').success).toBe(true)
  expect(crsUrnValidator.safeParse('urn:ogc:def:crs:OGC:1.3:CRS84').success).toBe(true)
  expect(crsUrnValidator.safeParse('urn:ogc:def:crs:EPSG:1.32:2972').success).toBe(true)
  expect(crsUrnValidator.safeParse('urn:ogc:def:crs:EPSG::PLOP').success).toBe(false)
  expect(crsUrnValidator.safeParse('urn:ogc:def:crs:EPSG::').success).toBe(false)
})
test('featureForagePropertiesValidator', () => {
  const featureForageProperties: z.infer<typeof featureForagePropertiesValidator> = {
    nom: 'A',
    type: 'piézomètre',
    profondeur: 0,
  }
  const featureForagePropertiesCasse = {
    nom: 'B',
    type: 'pi�zom�tre',
    profondeur: 0,
  }
  expect(z.array(featureForagePropertiesValidator).parse([featureForageProperties, featureForagePropertiesCasse])).toMatchInlineSnapshot(`
    [
      {
        "nom": "A",
        "profondeur": 0,
        "type": "piézomètre",
      },
      {
        "nom": "B",
        "profondeur": 0,
        "type": "piézomètre",
      },
    ]
  `)
})
