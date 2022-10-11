import { ITitreEtape } from '../../types'

import { titreEtapesSortAscByOrdre } from '../utils/titre-etapes-sort'
import { titreEtapePublicationCheck } from './titre-etape-publication-check'
import {
  DemarcheTypeId,
  isDemarcheTypeWithPhase
} from 'camino-common/src/static/demarchesTypes'

/**
 * Vérifie si la démarche donne lieu à une phase
 * @param titreDemarcheTypeId - id du type de la démarche
 * @param titreDemarcheStatutId - id du statut de la démarche
 * @param titreTypeId - id du type de titre
 * @param titreEtapes - étapes de la démarche
 */
export const titreDemarchePhaseCheck = (
  titreDemarcheTypeId: DemarcheTypeId,
  titreDemarcheStatutId: string,
  titreTypeId: string,
  titreEtapes?: ITitreEtape[] | null
) => {
  // si
  // - la démarche n'a pas d'étapes
  // - ou le statut de la démarche n'est pas accepté
  // - ou le type de la démarche ne donne pas lieu à une phase
  //   - et la démarche n'a ni date de fin ou ni durée
  if (
    !titreEtapes?.length ||
    titreDemarcheStatutId !== 'acc' ||
    (!isDemarcheTypeWithPhase(titreDemarcheTypeId) &&
      !titreEtapes.find(e => e.dateFin || e.duree))
  ) {
    return false
  }

  // on trie les étapes de façon ascendante pour le cas où
  // il existe une étape de publication et une étape rectificative,
  // on prend alors en compte l'originale
  const etapePublicationFirst = titreEtapesSortAscByOrdre(titreEtapes!).find(
    etape => titreEtapePublicationCheck(etape.typeId, titreTypeId)
  )

  return etapePublicationFirst
    ? ['acc', 'fai'].includes(etapePublicationFirst.statutId)
    : false
}
