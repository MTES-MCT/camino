// retourne l'id de la dernière étape acceptée
// de la dernière démarche acceptée
// pour laquelle la propriété existe

import { DemarchesStatutsIds, DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts.js'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId, isDemarcheTypeOctroi } from 'camino-common/src/static/demarchesTypes.js'
import { PHASES_STATUTS_IDS } from 'camino-common/src/static/phasesStatuts.js'
import { TitresStatutIds, TitreStatutId } from 'camino-common/src/static/titresStatuts.js'
import { ITitreDemarche, ITitreEtape, IPropId, IContenuId } from '../../types.js'

import { propValueFind } from '../utils/prop-value-find.js'
import titreDemarchesSortAsc from '../utils/titre-elements-sort-asc.js'
import { titreEtapesSortDescByOrdre } from '../utils/titre-etapes-sort.js'

const etapeAmodiataireFind = (titreEtape: ITitreEtape, titreDemarches: ITitreDemarche[]) => {
  const titreDemarche = titreDemarches.find(td => td.id === titreEtape.titreDemarcheId)

  if (titreDemarche!.phase?.phaseStatutId === 'val') {
    return true
  }

  const titreDemarchePrevious = titreDemarches.find(td => !!td.phase)

  if (titreDemarchePrevious?.phase?.phaseStatutId === 'val') {
    return true
  }

  return false
}

const etapeValideCheck = (titreEtape: ITitreEtape, titreDemarcheTypeId: DemarcheTypeId, titreStatutId: string, propId?: IPropId) => {
  // si l'étape est une demande et que le titre est en demande initiale (statut réservé au octroi)
  if (titreEtape.typeId === 'mfr' && titreStatutId === 'dmi') {
    return true
  }

  // si l'étape n'a pas le statut acceptée, fait ou favorable
  if (!['acc', 'fai', 'fav'].includes(titreEtape.statutId)) {
    return false
  }

  // si la démarche est un octroi, une demande de titre d'exploitation ou une mutation partielle
  if (isDemarcheTypeOctroi(titreDemarcheTypeId)) {
    return true
  }
  // si il s'agit d'une étape de décision
  if (['dpu', 'dup', 'rpu', 'dex', 'dux', 'dim', 'def', 'sco', 'aco'].includes(titreEtape.typeId)) {
    return true
  }

  // si
  // - le titre est en modification en instance
  // - et que la prop est points, surface, substances ou communes
  if (propId && titreStatutId && ['points', 'surface', 'communes', 'forets'].includes(propId) && titreStatutId === 'mod') {
    return true
  }

  return false
}

const titreDemarchePropTitreEtapeFind = (propId: IPropId, titreDemarcheEtapes: ITitreEtape[], titreDemarcheTypeId: DemarcheTypeId, titreStatutId: string, titreDemarches: ITitreDemarche[]) =>
  titreEtapesSortDescByOrdre(titreDemarcheEtapes).find((titreEtape: ITitreEtape) => {
    const isEtapeValide = etapeValideCheck(titreEtape, titreDemarcheTypeId, titreStatutId, propId)

    if (!isEtapeValide) return false

    const prop = propValueFind(titreEtape, propId)

    if (prop === null) return false

    if (propId === 'amodiataires') {
      return etapeAmodiataireFind(titreEtape, titreDemarches)
    }

    return true
  }) || null

// retourne la première étape valide qui contient l'élément dans la section
const titreDemarcheContenuTitreEtapeFind = ({ sectionId, elementId }: IContenuId, titreDemarcheEtapes: ITitreEtape[], titreDemarcheTypeId: DemarcheTypeId, titreStatutId: string) =>
  titreEtapesSortDescByOrdre(titreDemarcheEtapes).find(
    titreEtape =>
      etapeValideCheck(titreEtape, titreDemarcheTypeId, titreStatutId) &&
      // détermine si l'étape contient la section et l'élément
      titreEtape.contenu &&
      titreEtape.contenu[sectionId] &&
      titreEtape.contenu[sectionId][elementId] !== undefined
  ) || null

// si
// - la démarches est acceptée, terminée
// - ou la démarche est un octroi
// - ou le titre a le statut modification en instance
//   - et la démarche est une prolongation ou une demande de titre
//   - et la démarche n'a aucune phase valide
const demarcheEligibleCheck = (titreDemarcheStatutId: DemarcheStatutId, titreDemarcheTypeId: DemarcheTypeId, titreStatutId: TitreStatutId, titreDemarches: ITitreDemarche[]) =>
  [DemarchesStatutsIds.Accepte, DemarchesStatutsIds.Termine].includes(titreDemarcheStatutId) ||
  isDemarcheTypeOctroi(titreDemarcheTypeId) ||
  (titreStatutId === TitresStatutIds.ModificationEnInstance &&
    [DEMARCHES_TYPES_IDS.Prolongation, DEMARCHES_TYPES_IDS.Prolongation1, DEMARCHES_TYPES_IDS.Prolongation2, DEMARCHES_TYPES_IDS.Prorogation, DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation].includes(
      titreDemarcheTypeId
    ) &&
    !titreDemarches.find(td => td.phase && td.phase.phaseStatutId === PHASES_STATUTS_IDS.Valide))

/**
 * Trouve l'id de l'étape de référence pour une propriété
 * @param propId - nom de la propriété
 * @param titreDemarches - démarches du titre
 * @param titreStatutId - statut du titre
 * @returns id d'une etape
 */

const titrePropTitreEtapeFind = (propId: IPropId, titreDemarches: ITitreDemarche[], titreStatutId: TitreStatutId): ITitreEtape | null => {
  const titreDemarchesSorted = titreDemarchesSortAsc(titreDemarches).reverse()

  const titreEtape = titreDemarchesSorted.reduce((etape: ITitreEtape | null, titreDemarche: ITitreDemarche) => {
    // si une étape a déjà été trouvée
    if (etape) return etape

    // si la démarche n'est pas éligible
    if (!demarcheEligibleCheck(titreDemarche.statutId!, titreDemarche.typeId, titreStatutId, titreDemarches)) {
      return null
    }

    return titreDemarchePropTitreEtapeFind(propId, titreDemarche.etapes!, titreDemarche.typeId, titreStatutId, titreDemarchesSorted)
  }, null)

  return titreEtape
}

/**
 * Trouve l'étape de référence pour un contenu
 * @param sectionIds - id de la section et de l'élément du contenu
 * @param titreDemarches - démarches du titre
 * @param titreStatutId - statut du titre
 * @returns une étape ou null
 */

const titreContenuTitreEtapeFind = ({ sectionId, elementId }: IContenuId, titreDemarches: ITitreDemarche[], titreStatutId: TitreStatutId) => {
  const titreDemarchesSorted = titreDemarchesSortAsc(titreDemarches).reverse()

  const titreEtape = titreDemarchesSorted.reduce((etape: ITitreEtape | null, titreDemarche: ITitreDemarche) => {
    // si une étape a déjà été trouvée
    if (etape) return etape

    if (!demarcheEligibleCheck(titreDemarche.statutId!, titreDemarche.typeId, titreStatutId, titreDemarches)) {
      return null
    }

    return titreDemarcheContenuTitreEtapeFind({ sectionId, elementId }, titreDemarche.etapes!, titreDemarche.typeId, titreStatutId)
  }, null)

  return titreEtape
}

export { titrePropTitreEtapeFind, titreContenuTitreEtapeFind }
