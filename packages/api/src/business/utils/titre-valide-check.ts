import { ITitreDemarche } from '../../types.js'

import { CaminoDate } from 'camino-common/src/date.js'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes.js'

/**
 * Vérifie la validité du titre pendant la période
 * @param titreDemarches - démarches du titre
 * @param dateDebut - date de début
 * @param dateFin - date de fin
 * @param titreTypeId - id du type de titre
 * @param hasDemarcheDeposee - si un titre échu avec une démarche déposée doit être pris en compte
 */
export const titreValideCheck = (titreDemarches: Pick<ITitreDemarche, 'typeId' | 'demarcheDateDebut' | 'demarcheDateFin'>[], dateDebut: CaminoDate, dateFin: CaminoDate) => {
  const demarches = titreDemarches.filter(d => !DemarchesTypes[d.typeId].travaux)

  // si le titre a une phase entre dateDebut et dateFin
  if (
    demarches.some(({ demarcheDateDebut, demarcheDateFin }) => {
      if (!demarcheDateDebut) {
        return false
      } else if (demarcheDateFin) {
        return dateDebut <= demarcheDateFin && dateFin >= demarcheDateDebut
      } else {
        return dateFin >= demarcheDateDebut
      }
    })
  ) {
    return true
  }


  return false
}
