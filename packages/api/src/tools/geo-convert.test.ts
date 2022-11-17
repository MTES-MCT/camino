import { geoConvert } from './geo-convert'
import { GEO_SYSTEME_IDS } from 'camino-common/src/static/geoSystemes'
import { describe, expect, test } from 'vitest'

describe('teste la conversion des projections', () => {
  test.each([[1234], [1.199826706437144], [49.869381812347456]])(
    'la conversion vers le système géo par défaut ne fait pas de conversion',
    x => {
      expect(geoConvert(GEO_SYSTEME_IDS.WGS84, { x, y: 1 })).toEqual({
        x,
        y: 1
      })
    }
  )
})
