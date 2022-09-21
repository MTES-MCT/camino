export const datesDiffInDays = (a: Date, b: Date) => {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate(), a.getHours(), a.getMinutes())
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours(), b.getMinutes())

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24))
}

export const daysBetween = (a: CaminoDate, b: CaminoDate) => {
  const utc1 = new Date(a).getTime()
  const utc2 = new Date(b).getTime()

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24))
}

export type CaminoDate = string & { __camino: 'Date' }

export type CaminoAnnee = string & { __camino: 'Annee' }

export const getAnnee = (date: CaminoDate): CaminoAnnee => {
  return valideAnnee(date.substring(0, 4))
}

export const isAnnee = (annee: string): annee is CaminoAnnee => {
  return !!annee.match(/^[0-9]{4}$/)
}

export function checkValideAnnee(annee: string): asserts annee is CaminoAnnee {
  if (!isAnnee(annee)) {
    throw new Error(`l'année ${annee} n'est pas une année valide`)
  }
}

export function valideAnnee(annee: string): CaminoAnnee {
  if (!isAnnee(annee)) {
    throw new Error(`l'année ${annee} n'est pas une année valide`)
  }

  return annee
}
