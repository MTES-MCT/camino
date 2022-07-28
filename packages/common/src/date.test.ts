import { datesDiffInDays } from './date'

test.each`
  date1                         | date2                         | days
  ${'2020-06-02T13:35:11.366Z'} | ${'2021-06-03T13:35:11.366Z'} | ${366}
  ${'2021-06-02T13:35:11.366Z'} | ${'2021-06-03T13:35:11.366Z'} | ${1}
  ${'2021-06-02T13:35:11.366Z'} | ${'2021-06-02T13:40:11.366Z'} | ${0}
  ${'2021-06-02T13:35:11.366Z'} | ${'2021-06-03T11:30:11.366Z'} | ${0}
`('calcul le nombre de jours entre 2 dates', ({ date1, date2, days }: { date1: string; date2: string; days: number }) => {
  expect(datesDiffInDays(new Date(date1), new Date(date2))).toBe(days)
})
