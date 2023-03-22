import { ITitreDemarche } from '../../types.js'

import { titreStatutIdFind } from '../rules/titre-statut-id-find.js'
import { titreDemarchesEtapesRebuild } from './titre-demarches-etapes-rebuild.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { CaminoDate } from 'camino-common/src/date.js'

/**
 * Vérifie la validité du titre pendant la période
 * @param titreDemarches - démarches du titre
 * @param dateDebut - date de début
 * @param dateFin - date de fin
 * @param titreTypeId - id du type de titre
 * @param hasDemarcheDeposee - si un titre échu avec une démarche déposée doit être pris en compte
 */
export const titreValideCheck = (titreDemarches: ITitreDemarche[], dateDebut: CaminoDate, dateFin: CaminoDate, titreTypeId: TitreTypeId, hasDemarcheDeposee = false) => {
  const demarches = titreDemarches.filter(d => !d.type!.travaux)

  // si le titre a une phase entre dateDebut et dateFin
  if (
    demarches.some(({ phase }) => {
      if (!phase) {
        return false
      } else if (phase.dateFin) {
        return dateDebut <= phase.dateFin && dateFin >= phase.dateDebut
      } else {
        return dateFin >= phase.dateDebut
      }
    })
  ) {
    return true
  }

  const newTitreDemarches = titreDemarchesEtapesRebuild(dateDebut, demarches, titreTypeId)

  // si le titre a le statut "modification en instance" au moment de dateDebut
  const titreStatutId = titreStatutIdFind(dateDebut, newTitreDemarches)

  if (titreStatutId === 'mod') return true

  // si
  // - on souhaite savoir si le titre a une démarche déposée
  // - le titre a le statut échu
  // - le titre a plusieurs démarches
  // - la dernière démarche a le statut déposée
  if (hasDemarcheDeposee && titreStatutId === 'ech' && newTitreDemarches.length > 1 && newTitreDemarches[0].statutId === 'dep') {
    return true
  }

  return false
}
