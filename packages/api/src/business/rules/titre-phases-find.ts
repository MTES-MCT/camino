import { ITitreDemarche, ITitreEtape } from '../../types'
import { demarcheEnregistrementDemandeDateFind, DemarcheId } from 'camino-common/src/demarche'

import { titreEtapesSortAscByOrdre, titreEtapesSortDescByOrdre } from '../utils/titre-etapes-sort'
import { titreEtapePublicationCheck } from './titre-etape-publication-check'
import { titreDemarcheAnnulationDateFinFind } from './titre-demarche-annulation-date-fin-find'
import { isDemarcheTypeAnnulation, isDemarcheTypeOctroi, isDemarcheTypeWithPhase } from 'camino-common/src/static/demarchesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { CaminoDate, dateAddMonths, isBefore, toCaminoDate } from 'camino-common/src/date'
import { titreDemarcheSortAsc } from '../utils/titre-elements-sort-asc'
import { ETAPES_STATUTS, isEtapeStatusRejete } from 'camino-common/src/static/etapesStatuts'
import { demarcheStatutIdsSuccess, isDemarcheStatutNonStatue } from 'camino-common/src/static/demarchesStatuts'
import { ETAPES_TYPES, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefinedOrEmpty, NonEmptyArray } from 'camino-common/src/typescript-tools'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'
import { machineFind } from '../rules-demarches/machines'
import { toMachineEtapes } from '../rules-demarches/machine-common'
import { DemarcheStatus, getPhase } from '../rules-demarches/machine-helper'
const DATE_PAR_DEFAUT_TITRE_INFINI = toCaminoDate('2018-12-31')
/**
 * trouve une démarche acceptée ou terminée qui est
 * - un retrait
 * - ou une renonciation
 *   - et ce n'est pas une renonciation partielle
 *   (= ne contient pas d'étape avec des infos géo (points)
 */
const titreDemarcheAnnulationFind = (titreDemarches: TitreDemarchePhaseFind[]) =>
  titreDemarches.find(titreDemarche => demarcheStatutIdsSuccess.has(titreDemarche.statutId!) && isDemarcheTypeAnnulation(titreDemarche.typeId))

const findDateDebut = (demarche: TitreDemarchePhaseFind, titreTypeId: TitreTypeId, isEtapeDateEnough: boolean): CaminoDate | null => {
  let dateDebut = null
  if (isNullOrUndefinedOrEmpty(demarche.etapes)) {
    return dateDebut
  }

  const sortedEtapes = titreEtapesSortAscByOrdre(demarche.etapes)
  // on trie les étapes de façon ascendante pour le cas où
  // il existe une étape de publication et une étape rectificative,
  // on prend alors en compte l'originale
  const etapePublicationFirst = sortedEtapes.findIndex(etape => titreEtapePublicationCheck(etape.typeId, titreTypeId) && [ETAPES_STATUTS.ACCEPTE, ETAPES_STATUTS.FAIT].includes(etape.statutId))

  if (etapePublicationFirst !== -1) {
    // si on le statut est 'FAIT', on doit trouver le statut dans la décision de l'administration précédente
    if (
      sortedEtapes[etapePublicationFirst].statutId === ETAPES_STATUTS.FAIT &&
      sortedEtapes[etapePublicationFirst - 1]?.typeId === ETAPES_TYPES.decisionDeLAutoriteAdministrative &&
      isEtapeStatusRejete(sortedEtapes[etapePublicationFirst - 1]?.statutId)
    ) {
      return null
    }

    // retourne l’étape de publication la plus récente avec une date de début spécifiée
    const etapePublicationHasDateDebut = titreEtapesSortDescByOrdre(demarche.etapes).find(
      titreEtape => titreEtapePublicationCheck(titreEtape.typeId, titreTypeId) && isNotNullNorUndefined(titreEtape.dateDebut)
    )

    if (etapePublicationHasDateDebut?.dateDebut) {
      dateDebut = etapePublicationHasDateDebut.dateDebut
    } else {
      // retourne la première étape de publication de la démarche
      const titreEtapePublicationFirst = titreEtapesSortAscByOrdre(demarche.etapes).find(te => titreEtapePublicationCheck(te.typeId, titreTypeId))

      if (!titreEtapePublicationFirst) {
        return null
      }
      if (isEtapeDateEnough) {
        // sinon la date de début est égale à la date de la première étape de publication
        dateDebut = titreEtapePublicationFirst.date
      }
    }
  }

  return dateDebut
}
const isTitreDemarchePhaseFindWithEtapes = (titreDemarche: TitreDemarchePhaseFind | undefined): titreDemarche is TitreDemarchePhaseFindWithEtapes =>
  isNotNullNorUndefined(titreDemarche) && isNotNullNorUndefinedNorEmpty(titreDemarche.etapes)

type Phase = { dateDebut: CaminoDate; dateFin: CaminoDate | null }
type IntermediateTitrePhase = Phase & { demarcheId: DemarcheId; dateDeFinParDefaut?: true }
export const titrePhasesFind = (titreDemarches: TitreDemarchePhaseFind[], titreTypeId: TitreTypeId): { [key in DemarcheId]?: Phase } => {
  const sortedDemarches = titreDemarcheSortAsc(titreDemarches).map(demarche => {
    return {
      ...demarche,
      // TODO 2025-01-07 renommer fullEtapes en etapes le jour où on supprime TDE
      fullEtapes: demarche.etapes,
      etapes: demarche.etapes?.filter(({ isBrouillon }) => isBrouillon === ETAPE_IS_NOT_BROUILLON),
    }
  })

  const titreDemarcheAnnulation = titreDemarcheAnnulationFind(titreDemarches)
  const titreDemarcheAnnulationDate = isTitreDemarchePhaseFindWithEtapes(titreDemarcheAnnulation) ? titreDemarcheAnnulationDateFinFind(titreTypeId, titreDemarcheAnnulation) : null

  const filteredDemarches = sortedDemarches.filter(
    demarche =>
      isNotNullNorUndefinedNorEmpty(demarche.etapes) &&
      (isDemarcheTypeWithPhase(demarche.typeId) || demarche.etapes.some(({ dateFin, duree }) => isNotNullNorUndefined(dateFin) || (isNotNullNorUndefined(duree) && duree !== 0)))
  )

  const phases = filteredDemarches.reduce<IntermediateTitrePhase[]>((acc, demarche) => {
    if (!isTitreDemarchePhaseFindWithEtapes(demarche)) {
      return acc
    }
    const machine = machineFind(titreTypeId, demarche.typeId, demarche.id, demarcheEnregistrementDemandeDateFind(demarche.fullEtapes))
    let phase
    let statut: DemarcheStatus | undefined
    if (isNotNullNorUndefined(machine)) {
      statut = machine.demarcheStatut(toMachineEtapes(demarche.fullEtapes))
      phase = getPhase(statut)
    }
    const isFirstPhase = acc.length === 0
    let dateDebutTDE: CaminoDate | null | undefined = findDateDebut(demarche, titreTypeId, isFirstPhase || (acc[acc.length - 1].dateDeFinParDefaut ?? false))

    if (isFirstPhase) {
      if (isNotNullNorUndefined(machine) && isNotNullNorUndefined(statut)) {
        if (demarcheStatutIdsSuccess.has(statut.demarcheStatut) && isNotNullNorUndefined(phase) && isNotNullNorUndefined(phase.debut) && isNotNullNorUndefined(phase.fin)) {
          acc.push({
            dateDebut: phase.debut,
            dateFin: phase.fin,
            demarcheId: demarche.id,
          })
        }
      } else {
        // TODO 2025-01-06 à virer quand on vire TDE
        if (!isDemarcheTypeOctroi(demarche.typeId)) {
          return acc
        }

        if (dateDebutTDE) {
          const { duree, dateFin } = titreDemarcheNormaleDateFinAndDureeFind(demarche.etapes)
          if (dateFin) {
            acc.push({
              dateDebut: dateDebutTDE,
              dateFin,
              demarcheId: demarche.id,
            })
          } else if (duree) {
            acc.push({
              dateDebut: dateDebutTDE,
              dateFin: dateAddMonths(dateDebutTDE, duree),
              demarcheId: demarche.id,
            })
          } else {
            // si il n'y a pas de durée,
            // la date de fin par défaut est fixée au 31 décembre 2018,
            // selon l'article L144-4 du code minier :
            // https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000023501962&idArticle=LEGIARTI000023504741
            acc.push({
              dateDebut: dateDebutTDE,
              dateFin: DATE_PAR_DEFAUT_TITRE_INFINI,
              dateDeFinParDefaut: true,
              demarcheId: demarche.id,
            })
          }
        }
      }

      return acc
    } else {
      if (isNotNullNorUndefined(machine) && isNotNullNorUndefined(statut)) {
        if (isNotNullNorUndefined(phase) && isNotNullNorUndefined(phase.debut)) {
          let dateDebut: CaminoDate = phase.debut
          let dateFin: CaminoDate | null = phase.fin
          if ('demarcheDateDebut' in statut) {
            if (isNotNullNorUndefined(statut.demarcheDateDebut.dateDebut)) {
              acc[acc.length - 1].dateFin = statut.demarcheDateDebut.dateDebut
            } else {
              dateDebut = acc[acc.length - 1].dateFin ?? phase.debut // le ?? est pour typescript uniquement, la date de fin de la phase précédente ne PEUT PAS être null
              if (isNotNullNorUndefined(statut.demarcheDateFin.duree)) {
                dateFin = dateAddMonths(dateDebut, statut.demarcheDateFin.duree)
              }
            }
          }
          acc.push({
            dateDebut,
            dateFin,
            demarcheId: demarche.id,
          })
        }
      } else {
        // TODO 2025-01-06 à virer quand on vire TDE
        if (!dateDebutTDE) {
          dateDebutTDE = acc[acc.length - 1].dateFin

          if (!dateDebutTDE) {
            return acc
          }
        } else {
          acc[acc.length - 1].dateFin = dateDebutTDE
        }
        const { duree, dateFin } = titreDemarcheNormaleDateFinAndDureeFind(demarche.etapes)

        if (!dateFin || dateFin > dateDebutTDE) {
          if (dateFin) {
            acc.push({
              dateDebut: dateDebutTDE,
              dateFin,
              demarcheId: demarche.id,
            })
          } else if (duree) {
            acc.push({
              dateDebut: dateDebutTDE,
              dateFin: dateAddMonths(dateDebutTDE, duree),
              demarcheId: demarche.id,
            })
          } else if (isDemarcheStatutNonStatue(demarche.statutId)) {
            acc.push({
              dateDebut: dateDebutTDE,
              dateFin: null,
              demarcheId: demarche.id,
            })
          }
        }
      }
    }

    return acc
  }, [])

  return phases.reduce<Record<DemarcheId, Phase>>((acc, p) => {
    delete p.dateDeFinParDefaut
    if (titreDemarcheAnnulationDate && p.dateFin && isBefore(titreDemarcheAnnulationDate, p.dateFin) && isBefore(p.dateDebut, titreDemarcheAnnulationDate)) {
      p.dateFin = titreDemarcheAnnulationDate
    }

    acc[p.demarcheId] = { dateDebut: p.dateDebut, dateFin: p.dateFin }

    return acc
  }, {})
}

export type TitreEtapePhaseFind = Pick<
  ITitreEtape,
  | 'titreDemarcheId'
  | 'ordre'
  | 'typeId'
  | 'dateFin'
  | 'duree'
  | 'dateDebut'
  | 'date'
  | 'statutId'
  | 'geojson4326Perimetre'
  | 'isBrouillon'
  | 'concurrence'
  | 'demarcheIdsConsentement'
  | 'communes'
  | 'surface'
  | 'hasTitreFrom'
>
export type TitreDemarchePhaseFind = Pick<ITitreDemarche, 'statutId' | 'ordre' | 'typeId' | 'id' | 'titreId' | 'demarcheDateDebut' | 'demarcheDateFin'> & { etapes?: TitreEtapePhaseFind[] }
export type TitreDemarchePhaseFindWithEtapes = Pick<ITitreDemarche, 'statutId' | 'ordre' | 'typeId' | 'id' | 'titreId' | 'demarcheDateDebut' | 'demarcheDateFin'> & {
  etapes: NonEmptyArray<TitreEtapePhaseFind>
  fullEtapes: NonEmptyArray<TitreEtapePhaseFind>
}
const etapeTypesIds: EtapeTypeId[] = ['dpu', 'rpu', 'dex', 'def', 'sco', 'aco']
const titreDemarcheNormaleDateFinAndDureeFind = (titreEtapes: TitreEtapePhaseFind[]): { duree: number; dateFin: CaminoDate | null | undefined } => {
  const titreEtapesSorted = titreEtapesSortDescByOrdre(titreEtapes)

  const derniereDecisionIndex = titreEtapesSorted.findIndex(({ typeId }) => [ETAPES_TYPES.publicationDeDecisionAuJORF, ETAPES_TYPES.decisionDeLAutoriteAdministrative].includes(typeId))

  const derniereDecision = titreEtapesSorted[derniereDecisionIndex]
  if (isNotNullNorUndefined(derniereDecision)) {
    if (isEtapeStatusRejete(derniereDecision.statutId)) {
      return { dateFin: derniereDecision.date, duree: 0 }
    } else if (
      derniereDecision.typeId === ETAPES_TYPES.publicationDeDecisionAuJORF &&
      titreEtapesSorted[derniereDecisionIndex + 1]?.typeId === ETAPES_TYPES.decisionDeLAutoriteAdministrative &&
      isEtapeStatusRejete(titreEtapesSorted[derniereDecisionIndex + 1]?.statutId)
    ) {
      return { dateFin: derniereDecision.date, duree: 0 }
    }
  }

  const desistementDemandeur = titreEtapesSorted.find(({ typeId }) => ETAPES_TYPES.desistementDuDemandeur === typeId)

  if (desistementDemandeur) {
    return { dateFin: desistementDemandeur.date, duree: 0 }
  }

  const titreEtapeHasDateFinOrDuree = titreEtapesSorted.find(
    ({ typeId, dateFin, duree }) => etapeTypesIds.includes(typeId) && (isNotNullNorUndefined(dateFin) || (isNotNullNorUndefined(duree) && duree !== 0))
  )

  if (!titreEtapeHasDateFinOrDuree) {
    const etapeClassementSansSuite = titreEtapesSorted.find(({ typeId }) => typeId === ETAPES_TYPES.classementSansSuite)

    if (etapeClassementSansSuite) {
      return { dateFin: etapeClassementSansSuite.date, duree: 0 }
    }

    return { dateFin: null, duree: 0 }
  }

  const { dateFin, duree } = titreEtapeHasDateFinOrDuree

  return {
    duree: duree ?? 0,
    dateFin,
  }
}
