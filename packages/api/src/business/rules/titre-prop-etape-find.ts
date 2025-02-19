// retourne l'id de la dernière étape acceptée
// de la dernière démarche acceptée
// pour laquelle la propriété existe

import { CaminoDate } from 'camino-common/src/date'
import { canImpactTitre, DemarcheTypeId, isDemarcheTypeOctroi } from 'camino-common/src/static/demarchesTypes'
import { isDemarchePhaseValide } from 'camino-common/src/static/phasesStatuts'
import { TitresStatutIds, TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { ITitreDemarche, ITitreEtape, IPropId, IContenuId } from '../../types'

import { propValueFind } from '../utils/prop-value-find'
import { titreDemarcheSortAsc } from '../utils/titre-elements-sort-asc'
import { titreEtapesSortDescByOrdre } from '../utils/titre-etapes-sort'
import { isEtapeDecision } from 'camino-common/src/static/etapesTypes'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { ETAPES_STATUTS, EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { ETAPE_IS_BROUILLON } from 'camino-common/src/etape'

const etapeAmodiataireFind = (date: CaminoDate, titreEtape: Pick<ITitreEtape, 'titreDemarcheId'>, titreDemarches: Pick<ITitreDemarche, 'demarcheDateDebut' | 'demarcheDateFin' | 'id'>[]) => {
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
const etapesStatutAccepteeFaitOuFavorable = [
  ETAPES_STATUTS.ACCEPTE,
  ETAPES_STATUTS.ACCEPTE_DECISION_IMPLICITE,
  ETAPES_STATUTS.FAIT,
  ETAPES_STATUTS.FAVORABLE,
] as const satisfies readonly EtapeStatutId[]
const etapeValideCheck = (titreEtape: Pick<ITitreEtape, 'typeId' | 'statutId' | 'isBrouillon'>, titreDemarcheTypeId: DemarcheTypeId, titreStatutId: TitreStatutId, propId?: IPropId) => {
  // si l'étape est une demande et que le titre est en demande initiale (statut réservé au octroi)
  if (titreEtape.typeId === 'mfr' && titreStatutId === 'dmi') {
    return true
  }

  if (titreEtape.isBrouillon === ETAPE_IS_BROUILLON) {
    return false
  }

  // si l'étape n'a pas le statut acceptée, fait ou favorable
  if (!etapesStatutAccepteeFaitOuFavorable.includes(titreEtape.statutId)) {
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
  if (propId && ['points', 'surface', 'communes', 'forets'].includes(propId) && [TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire].includes(titreStatutId)) {
    return true
  }

  return false
}

const titreDemarchePropTitreEtapeFind = <
  T extends Pick<
    ITitreEtape,
    | 'ordre'
    | 'typeId'
    | 'isBrouillon'
    | 'statutId'
    | 'titulaireIds'
    | 'amodiataireIds'
    | 'surface'
    | 'substances'
    | 'administrationsLocales'
    | 'communes'
    | 'forets'
    | 'titreDemarcheId'
    | 'geojson4326Perimetre'
  >,
>(
  date: CaminoDate,
  propId: IPropId,
  titreDemarcheEtapes: T[],
  titreDemarcheTypeId: DemarcheTypeId,
  titreStatutId: TitreStatutId,
  titreDemarches: Pick<ITitreDemarche, 'demarcheDateDebut' | 'demarcheDateFin' | 'id'>[]
): T | null =>
  titreEtapesSortDescByOrdre(titreDemarcheEtapes).find(titreEtape => {
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
      isNotNullNorUndefined(titreEtape.contenu[sectionId][elementId])
  ) || null

/**
 * Trouve l'id de l'étape de référence pour une propriété
 * @param propId - nom de la propriété
 * @param titreDemarches - démarches du titre
 * @param titreStatutId - statut du titre
 * @returns id d'une etape
 */

export const titrePropTitreEtapeFind = <
  T extends Pick<
    ITitreEtape,
    | 'ordre'
    | 'date'
    | 'typeId'
    | 'isBrouillon'
    | 'statutId'
    | 'titulaireIds'
    | 'amodiataireIds'
    | 'surface'
    | 'substances'
    | 'administrationsLocales'
    | 'communes'
    | 'forets'
    | 'titreDemarcheId'
    | 'geojson4326Perimetre'
  >,
>(
  date: CaminoDate,
  propId: IPropId,
  titreDemarches: (Pick<ITitreDemarche, 'ordre' | 'typeId' | 'statutId' | 'demarcheDateDebut' | 'demarcheDateFin' | 'id'> & { etapes?: T[] })[],
  titreStatutId: TitreStatutId
): NoInfer<T> | null => {
  const titreDemarchesSorted = titreDemarcheSortAsc(titreDemarches).reverse()

  const titreEtape = titreDemarchesSorted.reduce((etape: T | null, titreDemarche) => {
    // si une étape a déjà été trouvée
    if (etape) return etape

    if (!canImpactTitre(titreDemarche.typeId, titreDemarche.statutId!)) {
      return null
    }

    const etapes = titreDemarche.etapes
    if (isNullOrUndefined(etapes)) {
      return etape
    }

    return titreDemarchePropTitreEtapeFind(date, propId, etapes, titreDemarche.typeId, titreStatutId, titreDemarchesSorted)
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

export const titreContenuTitreEtapeFind = ({ sectionId, elementId }: IContenuId, titreDemarches: ITitreDemarche[], titreStatutId: TitreStatutId): ITitreEtape | null => {
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
