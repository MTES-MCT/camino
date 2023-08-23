import { z } from 'zod'

const datesDiffInDays = (a: Date, b: Date) => {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24))
}

export const daysBetween = (a: CaminoDate, b: CaminoDate) => {
  return datesDiffInDays(new Date(a), new Date(b))
}

export const isBefore = (a: CaminoDate, b: CaminoDate): boolean => {
  return a < b
}

export const caminoDateValidator = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .brand<'Date'>()
export type CaminoDate = z.infer<typeof caminoDateValidator>

export type CaminoDateFormated = string & { __camino: 'DateFormated' }

export const isCaminoDate = (date: string): date is CaminoDate => {
  try {
    toCaminoDate(date)

    return true
  } catch {
    return false
  }
}
export const toCaminoDate = (date: Date | string): CaminoDate => {
  if (typeof date === 'string') {
    const parsedDate = caminoDateValidator.safeParse(date)
    if (parsedDate.success && !isNaN(new Date(date).getTime())) {
      return parsedDate.data
    } else {
      throw new Error(`Invalid date string: ${date}`)
    }
  } else {
    // Use the Sweden locale because it uses the ISO format
    const dateString = date.toLocaleDateString('sv')
    const parsedDate = caminoDateValidator.safeParse(dateString)
    if (parsedDate.success) {
      return parsedDate.data
    }
  }
  throw new Error(`Shouldn't get here (invalid toDateStr provided): ${date}`)
}

export const caminoAnneeValidator = z.coerce
  .string()
  .regex(/^\d{4}$/)
  .brand<'Annee'>()
export type CaminoAnnee = z.infer<typeof caminoAnneeValidator>

export const getAnnee = (date: CaminoDate): CaminoAnnee => {
  return toCaminoAnnee(date.substring(0, 4))
}

export const getMois = (date: CaminoDate): number => {
  return Number(date.substring(5, 7))
}

export const getDay = (date: CaminoDate): number => {
  return Number(date.substring(8, 10))
}

export const dateFormat = (date: CaminoDate): CaminoDateFormated => {
  return `${date.substring(8)}-${date.substring(5, 7)}-${date.substring(0, 4)}` as CaminoDateFormated
}

export const getCurrent = () => toCaminoDate(new Date())
export const getCurrentAnnee = () => getAnnee(getCurrent())

export const isAnnee = (annee: string): annee is CaminoAnnee => {
  return caminoAnneeValidator.safeParse(annee).success
}

export const anneeSuivante = (annee: CaminoAnnee): CaminoAnnee => toCaminoAnnee(Number(annee) + 1)
export const anneePrecedente = (annee: CaminoAnnee): CaminoAnnee => toCaminoAnnee(Number(annee) - 1)

export const caminoAnneeToNumber = (annee: CaminoAnnee): number => Number.parseInt(annee, 10)

export function toCaminoAnnee(annee: string | number): CaminoAnnee {
  const parsed = caminoAnneeValidator.safeParse(annee)
  if (parsed.success) {
    return parsed.data
  }
  throw new Error(`l'année ${annee} n'est pas une année valide`)
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

export const intervalleAnnees = (anneeDepart: CaminoAnnee, anneeArrivee: CaminoAnnee): CaminoAnnee[] => {
  if (caminoAnneeToNumber(anneeDepart) > caminoAnneeToNumber(anneeArrivee)) {
    throw new Error(`L'année de départ ${anneeDepart} doit être inférieure à l'année d'arrivée ${anneeArrivee}`)
  }
  const annees = [anneeDepart]
  let currentAnnee = anneeDepart
  while (currentAnnee !== anneeArrivee) {
    currentAnnee = anneeSuivante(currentAnnee)
    annees.push(currentAnnee)
  }

  return annees
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
