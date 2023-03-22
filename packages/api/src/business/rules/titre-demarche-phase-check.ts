import { titreEtapesSortAscByOrdre } from '../utils/titre-etapes-sort.js'
import { titreEtapePublicationCheck } from './titre-etape-publication-check.js'
import { DemarcheTypeId, isDemarcheTypeWithPhase } from 'camino-common/src/static/demarchesTypes.js'
import { TitreEtapePhaseFind } from './titre-demarche-date-fin-duree-find.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { DemarchesStatutsIds, DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts.js'

/**
 * Vérifie si la démarche donne lieu à une phase
 * @param titreDemarcheTypeId - id du type de la démarche
 * @param titreDemarcheStatutId - id du statut de la démarche
 * @param titreTypeId - id du type de titre
 * @param titreEtapes - étapes de la démarche
 */
export const titreDemarchePhaseCheck = (titreDemarcheTypeId: DemarcheTypeId, titreDemarcheStatutId: DemarcheStatutId, titreTypeId: TitreTypeId, titreEtapes?: TitreEtapePhaseFind[] | null) => {
  // si
  // - la démarche n'a pas d'étapes
  // - ou le statut de la démarche n'est pas accepté
  // - ou le type de la démarche ne donne pas lieu à une phase
  //   - et la démarche n'a ni date de fin ou ni durée

  // FIXME Maintenant une démarche n’est pas forcément acceptée
  if (!titreEtapes?.length || titreDemarcheStatutId !== DemarchesStatutsIds.Accepte || (!isDemarcheTypeWithPhase(titreDemarcheTypeId) && !titreEtapes.some(e => e.dateFin || e.duree))) {
    return false
  }

  // on trie les étapes de façon ascendante pour le cas où
  // il existe une étape de publication et une étape rectificative,
  // on prend alors en compte l'originale
  const etapePublicationFirst = titreEtapesSortAscByOrdre(titreEtapes!).find(etape => titreEtapePublicationCheck(etape.typeId, titreTypeId))

  // FIXME si false, alors vérifié qu’il y a une demande
  return etapePublicationFirst ? ['acc', 'fai'].includes(etapePublicationFirst.statutId) : false
}
