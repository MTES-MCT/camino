import { anneeSuivante, datesDiffInDays, daysBetween, getAnnee, isAnnee, toCaminoDate, valideAnnee } from './date'

test.each`
  date1                         | date2                         | days
  ${'2020-06-02T13:35:11.366Z'} | ${'2021-06-03T13:35:11.366Z'} | ${366}
  ${'2021-06-02T13:35:11.366Z'} | ${'2021-06-03T13:35:11.366Z'} | ${1}
  ${'2021-06-02T13:35:11.366Z'} | ${'2021-06-02T13:40:11.366Z'} | ${0}
  ${'2021-06-02T13:35:11.366Z'} | ${'2021-06-03T11:30:11.366Z'} | ${0}
`('calcul le nombre de jours entre 2 dates', ({ date1, date2, days }: { date1: string; date2: string; days: number }) => {
  expect(datesDiffInDays(new Date(date1), new Date(date2))).toBe(days)
})

test('getAnnee', () => {
  expect(getAnnee(toCaminoDate('2022-12-52'))).toBe('2022')
  expect(getAnnee(toCaminoDate('1812-01-02'))).toBe('1812')
  expect(() => getAnnee(toCaminoDate('toto'))).toThrowErrorMatchingInlineSnapshot(`"Invalid date string: toto"`)
  expect(() => getAnnee(toCaminoDate('12'))).toThrowErrorMatchingInlineSnapshot(`"Invalid date string: 12"`)
  expect(() => getAnnee(toCaminoDate('20220'))).toThrowErrorMatchingInlineSnapshot(`"Invalid date string: 20220"`)
})

test('isAnnee', () => {
  expect(isAnnee('2022')).toBe(true)
  expect(isAnnee('1812')).toBe(true)
  expect(isAnnee('toto')).toBe(false)
  expect(isAnnee('12')).toBe(false)
  expect(isAnnee('20220')).toBe(false)
})

test('valideAnnee', () => {
  expect(valideAnnee('2022')).toBe('2022')
  expect(valideAnnee('1812')).toBe('1812')
  expect(valideAnnee(2022)).toBe('2022')
  expect(valideAnnee(1812)).toBe('1812')
  expect(() => valideAnnee('toto')).toThrowErrorMatchingInlineSnapshot(`"l'année toto n'est pas une année valide"`)
  expect(() => valideAnnee('12')).toThrowErrorMatchingInlineSnapshot(`"l'année 12 n'est pas une année valide"`)
  expect(() => valideAnnee('20220')).toThrowErrorMatchingInlineSnapshot(`"l'année 20220 n'est pas une année valide"`)
})

test('daysBetween', () => {
  expect(daysBetween(toCaminoDate('2020-06-02'), toCaminoDate('2020-06-10'))).toBe(8)
  expect(daysBetween(toCaminoDate('2020-01-02'), toCaminoDate('2020-01-31'))).toBe(29)
  // bisextile
  expect(daysBetween(toCaminoDate('2020-01-02'), toCaminoDate('2021-01-02'))).toBe(366)
  expect(daysBetween(toCaminoDate('2021-01-02'), toCaminoDate('2022-01-02'))).toBe(365)
  expect(daysBetween(toCaminoDate('2021-01-02'), toCaminoDate('2021-01-01'))).toBe(-1)
})
test('anneeSuivante', () => {
  expect(anneeSuivante(valideAnnee('2022'))).toBe(valideAnnee('2023'))
})
