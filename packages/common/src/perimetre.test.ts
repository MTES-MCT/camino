import { test, expect } from 'vitest'
import { equalGeojson } from './perimetre'

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
