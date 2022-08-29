import { FREQUENCES_IDS, getMonth, getPeriode } from './frequence'

test('getPeriode', () => {
  expect(Object.values(FREQUENCES_IDS).map(frequenceId => [...Array(13).keys()].map(periodeId => getPeriode(frequenceId, periodeId)))).toMatchSnapshot()
})
test('getMonth', () => {
  expect(getMonth('ann', 1)).toBe(0)
  expect(getMonth('tri', 1)).toBe(0)
  expect(getMonth('tri', 2)).toBe(3)
  expect(getMonth('tri', 3)).toBe(6)
  expect(getMonth('tri', 4)).toBe(9)
  expect(getMonth('men', 1)).toBe(0)
  expect(getMonth('men', 2)).toBe(1)
  expect(getMonth('men', 3)).toBe(2)
  expect(getMonth('men', 4)).toBe(3)
  expect(getMonth('men', 5)).toBe(4)
  expect(getMonth('men', 6)).toBe(5)
  expect(getMonth('men', 7)).toBe(6)
  expect(getMonth('men', 8)).toBe(7)
  expect(getMonth('men', 9)).toBe(8)

  expect(() => getMonth(undefined, 9)).toThrowError('Fréquence inconnue')
  expect(() => getMonth('men', 0)).toThrowError('Période 0 impossible (doit être entre 1 et 12 pour la fréquence men)')
  expect(() => getMonth('men', 13)).toThrowError('Période 13 impossible (doit être entre 1 et 12 pour la fréquence men)')
  expect(() => getMonth('tri', 5)).toThrowError('Période 5 impossible (doit être entre 1 et 4 pour la fréquence tri)')
  expect(() => getMonth('ann', 2)).toThrowError('Période 2 impossible (doit être entre 1 et 1 pour la fréquence ann)')
})
