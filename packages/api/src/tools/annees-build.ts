import { CaminoAnnee, getAnnee, intervalleAnnees, type CaminoDate } from 'camino-common/src/date'

export const anneesBuild = (dateDebut: CaminoDate, dateFin: CaminoDate): CaminoAnnee[] => {
  const anneeDebut = getAnnee(dateDebut)
  const anneeFin = getAnnee(dateFin)
  if (anneeDebut === anneeFin) {
    return [anneeDebut]
  }
  if (dateFin < dateDebut) {
    return []
  }
  return intervalleAnnees(anneeDebut, anneeFin)
}
