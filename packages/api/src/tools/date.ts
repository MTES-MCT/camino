import { CaminoDate, toCaminoDate } from 'camino-common/src/date.js'

export const dateValidate = (str: string | undefined | null) => {
  if (!str) return 'Date manquante'

  const date = new Date(str)

  if (date.toString() === 'Invalid Date') {
    return 'Date invalide'
  }

  return null
}

// ajoute une durée en jours à une string au format YYYY-MM-DD
export const dateAddDays = (date: CaminoDate, days: number): CaminoDate => {
  const [y, m, d] = date.split('-')

  return toCaminoDate(new Date(+y, +m - 1, +d + days))
}

// ajoute une durée en mois à une string au format YYYY-MM-DD
export const dateAddMonths = (date: CaminoDate, months: number): CaminoDate => {
  const [y, m, d] = date.split('-')

  return toCaminoDate(new Date(+y, +m - 1 + months, +d))
}

// calcul le nombre de mois entre 2 dates
export const datesSubtract = (dateDebut: string, dateFin: string) => {
  const [yDebut, mDebut] = dateDebut.split('-')
  const [yFin, mFin] = dateFin.split('-')

  return +yFin * 12 + +mFin - (+yDebut * 12 + +mDebut)
}
