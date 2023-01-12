import {
  anneePrecedente,
  anneeSuivante,
  datesDiffInDays,
  daysBetween,
  getAnnee,
  isAnnee,
  toCaminoDate,
  toCaminoAnnee,
  dateAddDays,
  dateAddMonths,
  dateValidate,
  setDayInMonth,
  monthsBetween
} from './date.js'
import { test, expect } from 'vitest'
test.each([
  ['2020-06-02T13:35:11.366Z', '2021-06-03T13:35:11.366Z', 366],
  ['2021-06-02T13:35:11.366Z', '2021-06-03T13:35:11.366Z', 1],
  ['2021-06-02T13:35:11.366Z', '2021-06-02T13:40:11.366Z', 0],
  ['2021-06-02T13:35:11.366Z', '2021-06-03T11:30:11.366Z', 0]
])('calcul le nombre de jours entre 2 dates', (date1, date2, days) => {
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

test('toCaminoAnnee', () => {
  expect(toCaminoAnnee('2022')).toBe('2022')
  expect(toCaminoAnnee('1812')).toBe('1812')
  expect(toCaminoAnnee(2022)).toBe('2022')
  expect(toCaminoAnnee(1812)).toBe('1812')
  expect(() => toCaminoAnnee('toto')).toThrowErrorMatchingInlineSnapshot(`"l'année toto n'est pas une année valide"`)
  expect(() => toCaminoAnnee('12')).toThrowErrorMatchingInlineSnapshot(`"l'année 12 n'est pas une année valide"`)
  expect(() => toCaminoAnnee('20220')).toThrowErrorMatchingInlineSnapshot(`"l'année 20220 n'est pas une année valide"`)
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
  expect(anneeSuivante(toCaminoAnnee('2022'))).toBe(toCaminoAnnee('2023'))
})
test('anneePrecedente', () => {
  expect(anneePrecedente(toCaminoAnnee('2022'))).toBe(toCaminoAnnee('2021'))
})
test("retourne une erreur si aucune date n'est fournie", () => {
  let tested = dateValidate(null)

  expect(tested).toBe({ valid: false, error: 'Date manquante' })

  tested = dateValidate(undefined)

  expect(tested).toBe({ valid: false, error: 'Date manquante' })
})

test('retourne null si la date est valide', () => {
  const res = dateValidate('1910-01-01')

  expect(res).toBe({ valid: true, date: toCaminoDate('1910-01-01') })
})

test('retourne une erreur la date est invalide', () => {
  const res = dateValidate('1910-123123123-123123113')

  expect(res).toBe({ valid: false, error: 'Date invalide' })
})

test.each([
  ['2020-01-01', 1, '2020-01-02'],
  ['2020-01-01', 10, '2020-01-11'],
  ['2020-01-01', 31, '2020-02-01'],
  ['2020-12-31', 1, '2021-01-01']
])('ajoute des jours à une date', (date, days, result) => {
  expect(dateAddDays(toCaminoDate(date), days)).toBe(result)
})

test.each([
  ['2020-01-01', 1, '2020-02-01'],
  ['2020-01-01', 12, '2021-01-01'],
  ['2020-01-01', 3, '2020-04-01'],
  ['2020-01-30', 3, '2020-04-30'],
  ['2020-01-31', 3, '2020-05-01'],
  ['2020-12-01', 3, '2021-03-01']
])('ajoute $months mois à la date $date', (date, months, result) => {
  expect(dateAddMonths(toCaminoDate(date), months)).toBe(result)
})

test("la méthode dateAddMonths n'est pas idempotente", () => {
  const date = '2022-05-30'

  expect(dateAddMonths(dateAddMonths(toCaminoDate(date), -3), 3)).toBe('2022-06-02')
})

test.each([
  ['2020-03-10', '2020-01-07', 2],
  ['2021-01-01', '2020-01-01', 12]
])('calcul le nombre de mois entre 2 dates', (dateFin, dateDebut, months) => {
  expect(monthsBetween(dateDebut, dateFin)).toBe(months)
})

test('setDayInMonth', () => {
  expect(setDayInMonth(toCaminoDate('2022-01-01'), 3)).toBe(toCaminoDate('2022-01-03'))
  expect(setDayInMonth(toCaminoDate('2022-01-31'), 3)).toBe(toCaminoDate('2022-01-03'))
})
