// retourne l'id de la dernière étape acceptée
// de la dernière démarche acceptée
// pour laquelle la propriété existe

import { CaminoDate } from 'camino-common/src/date.js'
import { canImpactTitre, DemarcheTypeId, isDemarcheTypeOctroi } from 'camino-common/src/static/demarchesTypes.js'
import { isDemarchePhaseValide } from 'camino-common/src/static/phasesStatuts.js'
import { TitresStatutIds, TitreStatutId } from 'camino-common/src/static/titresStatuts.js'
import { ITitreDemarche, ITitreEtape, IPropId, IContenuId } from '../../types.js'

import { propValueFind } from '../utils/prop-value-find.js'
import { titreDemarcheSortAsc } from '../utils/titre-elements-sort-asc.js'
import { titreEtapesSortDescByOrdre } from '../utils/titre-etapes-sort.js'
import { isEtapeDecision } from 'camino-common/src/static/etapesTypes.js'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools.js'

const etapeAmodiataireFind = (date: CaminoDate, titreEtape: ITitreEtape, titreDemarches: Pick<ITitreDemarche, 'demarcheDateDebut' | 'demarcheDateFin' | 'id'>[]) => {
  const titreDemarche = titreDemarches.find(td => td.id === titreEtape.titreDemarcheId)

  if (isDemarchePhaseValide(date, titreDemarche)) {
    return true
  }

  const titreDemarchePrevious = titreDemarches.find(td => !!td.demarcheDateDebut)

  if (isDemarchePhaseValide(date, titreDemarchePrevious)) {
    return true
  }

  return false
}

const etapeValideCheck = (titreEtape: ITitreEtape, titreDemarcheTypeId: DemarcheTypeId, titreStatutId: TitreStatutId, propId?: IPropId) => {
  // si l'étape est une demande et que le titre est en demande initiale (statut réservé au octroi)
  if (titreEtape.typeId === 'mfr' && titreStatutId === 'dmi') {
    return true
  }

  // si l'étape n'a pas le statut acceptée, fait ou favorable
  if (!['acc', 'fai', 'fav'].includes(titreEtape.statutId)) {
    return false
  }

  if (isDemarcheTypeOctroi(titreDemarcheTypeId)) {
    return true
  }
  if (isEtapeDecision(titreEtape.typeId)) {
    return true
  }

  // si
  // - le titre est en modification en instance
  // - et que la prop est points, surface, substances ou communes
  if (propId && titreStatutId && ['points', 'surface', 'communes', 'forets'].includes(propId) && [TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire].includes(titreStatutId)) {
    return true
  }

  return false
}

const titreDemarchePropTitreEtapeFind = (
  date: CaminoDate,
  propId: IPropId,
  titreDemarcheEtapes: ITitreEtape[],
  titreDemarcheTypeId: DemarcheTypeId,
  titreStatutId: TitreStatutId,
  titreDemarches: Pick<ITitreDemarche, 'demarcheDateDebut' | 'demarcheDateFin' | 'id'>[]
) =>
  titreEtapesSortDescByOrdre(titreDemarcheEtapes).find((titreEtape: ITitreEtape) => {
    const isEtapeValide = etapeValideCheck(titreEtape, titreDemarcheTypeId, titreStatutId, propId)

    if (!isEtapeValide) return false

    const prop = propValueFind(titreEtape, propId)

    if (isNullOrUndefined(prop)) return false

    if (propId === 'amodiataires') {
      return etapeAmodiataireFind(date, titreEtape, titreDemarches)
    }

    return true
  }) || null

// retourne la première étape valide qui contient l'élément dans la section
const titreDemarcheContenuTitreEtapeFind = ({ sectionId, elementId }: IContenuId, titreDemarcheEtapes: ITitreEtape[], titreDemarcheTypeId: DemarcheTypeId, titreStatutId: TitreStatutId) =>
  titreEtapesSortDescByOrdre(titreDemarcheEtapes).find(
    titreEtape =>
      etapeValideCheck(titreEtape, titreDemarcheTypeId, titreStatutId) &&
      // détermine si l'étape contient la section et l'élément
      isNotNullNorUndefined(titreEtape.contenu) &&
      isNotNullNorUndefined(titreEtape.contenu[sectionId]) &&
      titreEtape.contenu[sectionId][elementId] !== undefined
  ) || null

/**
 * Trouve l'id de l'étape de référence pour une propriété
 * @param propId - nom de la propriété
 * @param titreDemarches - démarches du titre
 * @param titreStatutId - statut du titre
 * @returns id d'une etape
 */

export const titrePropTitreEtapeFind = (
  date: CaminoDate,
  propId: IPropId,
  titreDemarches: Pick<ITitreDemarche, 'ordre' | 'typeId' | 'statutId' | 'demarcheDateDebut' | 'demarcheDateFin' | 'etapes' | 'id'>[],
  titreStatutId: TitreStatutId
): ITitreEtape | null => {
  const titreDemarchesSorted = titreDemarcheSortAsc(titreDemarches).reverse()

  const titreEtape = titreDemarchesSorted.reduce((etape: ITitreEtape | null, titreDemarche) => {
    // si une étape a déjà été trouvée
    if (etape) return etape

    if (!canImpactTitre(titreDemarche.typeId, titreDemarche.statutId!)) {
      return null
    }

    return titreDemarchePropTitreEtapeFind(date, propId, titreDemarche.etapes!, titreDemarche.typeId, titreStatutId, titreDemarchesSorted)
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

export const titreContenuTitreEtapeFind = ({ sectionId, elementId }: IContenuId, titreDemarches: ITitreDemarche[], titreStatutId: TitreStatutId) => {
  const titreDemarchesSorted = titreDemarcheSortAsc(titreDemarches).reverse()

  const titreEtape = titreDemarchesSorted.reduce((etape: ITitreEtape | null, titreDemarche: ITitreDemarche) => {
    // si une étape a déjà été trouvée
    if (etape) return etape

    if (!canImpactTitre(titreDemarche.typeId, titreDemarche.statutId!)) {
      return null
    }

    return titreDemarcheContenuTitreEtapeFind({ sectionId, elementId }, titreDemarche.etapes!, titreDemarche.typeId, titreStatutId)
  }, null)

  return titreEtape
}
