export const numberFormat = (number: number): string =>
  Intl.NumberFormat('FR-fr', {
    maximumSignificantDigits: 21,
  }).format(number)

export const ranges = [10, 50, 200, 500] as const
export type Range = (typeof ranges)[number]
export const isRange = (range: number): range is Range => ranges.includes(range)
