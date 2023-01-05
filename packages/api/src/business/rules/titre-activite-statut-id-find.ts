import { ITitreActivite } from '../../types.js'
import { dateAddMonths } from '../../tools/date.js'
import {
  ACTIVITES_STATUTS_IDS,
  ActivitesStatutId
} from 'camino-common/src/static/activitesStatuts.js'

/**
 * Trouve le statut d'une activité
 * @param titreActivite - activité
 * @param aujourdhui - date au format yyyy-mm-dd
 * @returns statut d'activité
 */

export const titreActiviteStatutIdFind = (
  titreActivite: ITitreActivite,
  aujourdhui: string
): ActivitesStatutId => {
  // si l'activité a un statut différent de "déposé" ou "fermé"

  if (
    ![ACTIVITES_STATUTS_IDS.DEPOSE, ACTIVITES_STATUTS_IDS.CLOTURE].includes(
      titreActivite.activiteStatutId
    )
  ) {
    const dateDelai = dateAddMonths(
      titreActivite.date,
      titreActivite.type!.delaiMois
    )

    // si le délai de remplissage est dépassé
    // passe le statut de l'activité à "fermé"

    if (aujourdhui > dateDelai) {
      return ACTIVITES_STATUTS_IDS.CLOTURE
    }

    return titreActivite.activiteStatutId
  }

  // sinon retourne le statut de l'activité
  return titreActivite.activiteStatutId
}
