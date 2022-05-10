export const numberFormat = (number: number): string =>
  Intl.NumberFormat('FR-fr', {
    maximumSignificantDigits: 21
  }).format(number)

/**
 * @deprecated use name import
 */
export default numberFormat
