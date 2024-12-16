import { toCaminoDate } from 'camino-common/src/date'
import { anneesBuild } from './annees-build'
import { describe, expect, test } from 'vitest'
describe('liste les années entre deux dates', () => {
  test("retourne un tableau d'années entre deux date", () => {
    expect(anneesBuild(toCaminoDate('2022-12-07'), toCaminoDate('2020-10-05'))).toEqual([])
    expect(anneesBuild(toCaminoDate('2020-12-07'), toCaminoDate('2020-10-05'))).toEqual(['2020'])
    expect(anneesBuild(toCaminoDate('2020-12-01'), toCaminoDate('2020-12-05'))).toEqual(['2020'])
    expect(anneesBuild(toCaminoDate('2015-12-01'), toCaminoDate('2020-12-05'))).toEqual(['2015', '2016', '2017', '2018', '2019', '2020'])
  })
})
