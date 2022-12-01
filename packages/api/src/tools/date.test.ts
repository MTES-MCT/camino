import {
  dateAddDays,
  dateAddMonths,
  datesSubtract,
  dateValidate
} from './date.js'
import { describe, expect, test } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'

describe('test les utilitaires de date', () => {
  test("retourne une erreur si aucune date n'est fournie", () => {
    const res = dateValidate(null)

    expect(res).toBe('Date manquante')
  })

  test('retourne null si la date est valide', () => {
    const res = dateValidate('1910-01-01')

    expect(res).toBe(null)
  })

  test('retourne une erreur la date est invalide', () => {
    const res = dateValidate('1910-123123123-123123113')

    expect(res).toBe('Date invalide')
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

    expect(dateAddMonths(dateAddMonths(toCaminoDate(date), -3), 3)).toBe(
      '2022-06-02'
    )
  })

  test.each([
    ['2020-03-10', '2020-01-07', 2],
    ['2021-01-01', '2020-01-01', 12]
  ])('calcul le nombre de mois entre 2 dates', (dateFin, dateDebut, months) => {
    expect(datesSubtract(dateDebut, dateFin)).toBe(months)
  })
})
