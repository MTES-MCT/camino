export const datesDiffInDays = (a: Date, b: Date) => {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate(), a.getHours(), a.getMinutes())
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours(), b.getMinutes())

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24))
}

export const daysBetween = (a: CaminoDate, b: CaminoDate) => {
  return datesDiffInDays(new Date(a), new Date(b))
}

export type CaminoDate = string & { __camino: 'Date' }
export type CaminoDateFormated = string & { __camino: 'DateFormated' }

const checkValidCaminoDate = (str: string): str is CaminoDate => {
  return str.match(/^\d{4}-\d{2}-\d{2}$/) !== null
}

export const toCaminoDate = (date: Date | string): CaminoDate => {
  if (typeof date === 'string') {
    if (checkValidCaminoDate(date)) {
      return date
    } else {
      throw new Error(`Invalid date string: ${date}`)
    }
  } else {
    // Use the Sweden locale because it uses the ISO format
    const dateString = date.toLocaleDateString('sv')
    if (checkValidCaminoDate(dateString)) {
      return dateString
    }
  }
  throw new Error(`Shouldn't get here (invalid toDateStr provided): ${date}`)
}
export type CaminoAnnee = string & { __camino: 'Annee' }

export const getAnnee = (date: CaminoDate): CaminoAnnee => {
  return toCaminoAnnee(date.substring(0, 4))
}

export const dateFormat = (date: CaminoDate): CaminoDateFormated => {
  return `${date.substring(8)}—${date.substring(5, 7)}-${date.substring(0, 4)}` as CaminoDateFormated
}

export const getCurrent = () => toCaminoDate(new Date())
export const getCurrentAnnee = () => getAnnee(getCurrent())

export const isAnnee = (annee: string): annee is CaminoAnnee => {
  return annee.match(/^\d{4}$/) !== null
}

export const anneeSuivante = (annee: CaminoAnnee): CaminoAnnee => toCaminoAnnee(Number(annee) + 1)
export const anneePrecedente = (annee: CaminoAnnee): CaminoAnnee => toCaminoAnnee(Number(annee) - 1)

export function checkValideAnnee(annee: string): asserts annee is CaminoAnnee {
  if (!isAnnee(annee)) {
    throw new Error(`l'année ${annee} n'est pas une année valide`)
  }
}

export function toCaminoAnnee(annee: string | number): CaminoAnnee {
  if (typeof annee === 'number') {
    return toCaminoAnnee(annee.toString(10))
  }
  checkValideAnnee(annee)

  return annee
}

export const dateValidate = (str: CaminoDate | string | undefined | null): { valid: true; date: CaminoDate } | { valid: false; error: 'Date manquante' | 'Date invalide' } => {
  if (!str) return { valid: false, error: 'Date manquante' }

  if (typeof str === 'string') {
    try {
      return { valid: true, date: toCaminoDate(str) }
    } catch (e) {
      return { valid: false, error: 'Date invalide' }
    }
  }

  return { valid: true, date: str }
}

export const dateAddDays = (date: CaminoDate, days: number): CaminoDate => {
  const [y, m, d] = date.split('-')

  return toCaminoDate(new Date(+y, +m - 1, +d + days))
}

export const dateAddMonths = (date: CaminoDate, months: number): CaminoDate => {
  const [y, m, d] = date.split('-')

  return toCaminoDate(new Date(+y, +m - 1 + months, +d))
}

export const monthsBetween = (dateDebut: string, dateFin: string) => {
  const [yDebut, mDebut] = dateDebut.split('-')
  const [yFin, mFin] = dateFin.split('-')

  return +yFin * 12 + +mFin - (+yDebut * 12 + +mDebut)
}

export function setDayInMonth(date: CaminoDate, day: number): CaminoDate {
  const [y, m] = date.split('-')

  return toCaminoDate(new Date(+y, +m - 1, +day))
}
