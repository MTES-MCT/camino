export const numberFormat = (number: number): string =>
  Intl.NumberFormat('FR-fr', {
    maximumSignificantDigits: 21,
  }).format(number)

const beginIndex = 'A'.charCodeAt(0)
/**
 * On s'en sert pour afficher les points automatiquement, de A, à ZZZZZZZ
 */
export const indexToLetter = (value: number): string => {
  const base26ValueArray = Array.from(value.toString(26))

  return base26ValueArray
    .map((value, index) => {
      if (index === base26ValueArray.length - 1) {
        return String.fromCharCode(beginIndex + parseInt(value, 26))
      }

      return String.fromCharCode(beginIndex + parseInt(value, 26) - 1)
    })
    .join('')
}

export const toDegresMinutes = (value: number): { degres: number; minutes: number } => {
  const degres = Math.trunc(value)
  const minutes = Math.abs((value - degres) * 60)

  return {
    degres,
    minutes: Number.parseFloat(minutes.toFixed(4)),
  }
}
