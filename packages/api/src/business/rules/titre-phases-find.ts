import { ITitrePhase } from '../../types.js'

import titreDemarcheDateFinAndDureeFind, { newTitreDemarcheNormaleDateFinAndDureeFind, TitreDemarchePhaseFind } from './titre-demarche-date-fin-duree-find.js'
import { titreDemarchePhaseCheck } from './titre-demarche-phase-check.js'
import { titreEtapesSortAscByOrdre, titreEtapesSortDescByOrdre } from '../utils/titre-etapes-sort.js'
import { titreEtapePublicationCheck } from './titre-etape-publication-check.js'
import { titreDemarcheAnnulationDateFinFind } from './titre-demarche-annulation-date-fin-find.js'
import { isDemarcheTypeOctroi, isDemarcheTypeWithPhase } from 'camino-common/src/static/demarchesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { CaminoDate, dateAddMonths, isBefore, toCaminoDate } from 'camino-common/src/date.js'
import { PhaseStatutId } from 'camino-common/src/static/phasesStatuts.js'
import { titreDemarcheSortAsc } from '../utils/titre-elements-sort-asc.js'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts.js'
import { DemarchesStatutsIds, isDemarcheStatutNonStatue } from 'camino-common/src/static/demarchesStatuts.js'
const DATE_PAR_DEFAUT_TITRE_INFINI = toCaminoDate('2018-12-31')
/**
 * trouve une démarche acceptée ou terminée qui est
 * - un retrait
 * - ou une renonciation
 *   - et ce n'est pas une renonciation partielle
 *   (= ne contient pas d'étape avec des infos géo (points)
 * @param titreDemarches - liste d’étapes
 */
const titreDemarcheAnnulationFind = (titreDemarches: TitreDemarchePhaseFind[]) =>
  titreDemarches.find(
    titreDemarche => ['acc', 'ter'].includes(titreDemarche.statutId!) && (titreDemarche.typeId === 'ret' || (titreDemarche.typeId === 'ren' && !titreDemarche.etapes!.find(te => te.points?.length)))
  )

export const titrePhasesFindOld = (titreDemarches: TitreDemarchePhaseFind[], aujourdhui: CaminoDate, titreTypeId: TitreTypeId): ITitrePhase[] => {
  // filtre les démarches qui donnent lieu à des phases
  const titreDemarchesFiltered = titreDemarches.filter(titreDemarche => titreDemarchePhaseCheck(titreDemarche.typeId, titreDemarche.statutId!, titreTypeId, titreDemarche.etapes))

  // FIXME ça devrait nous exploser dessus, car on ne l’a pas fait pour le moment
  const titreDemarcheAnnulation = titreDemarcheAnnulationFind(titreDemarches)
  const titreDemarcheAnnulationDate = titreDemarcheAnnulation?.etapes?.length ? titreDemarcheAnnulationDateFinFind(titreDemarcheAnnulation.etapes) : null

  return titreDemarchesFiltered.reduce((titrePhases: ITitrePhase[], titreDemarche, index) => {
    let dateFin = titrePhaseDateFinFind(titreDemarchesFiltered, titreDemarche)

    // si le titre contient une démarche d'annulation valide
    // et la date de fin de la phase est postérieure à la date d'annulation
    // alors la date de fin de la phase est la date d'annulation
    if ((titreDemarcheAnnulationDate && dateFin && isBefore(titreDemarcheAnnulationDate, dateFin)) || (titreDemarcheAnnulationDate && !dateFin)) {
      dateFin = titreDemarcheAnnulationDate
    }

    const dateDebut = titrePhaseDateDebutFind(titreDemarche, titrePhases, index, titreTypeId)

    // dateFin et dateDebut ne seront jamais `null`
    // car les démarches sont pré-filtrées

    // si
    // - la date du jour est plus récente que la date de fin
    // le statut est valide
    // sinon,
    // - le statut est échu
    let phaseStatutId: PhaseStatutId = 'val'
    if (!dateFin) {
      phaseStatutId = 'val'
    } else {
      phaseStatutId = isBefore(dateFin, aujourdhui) ? 'ech' : 'val'
    }

    // TODO:
    // est ce qu'on doit vérifier si une date de début
    // est postérieure a une date d'annulation avant d'ajouter la phase ?

    titrePhases.push({
      titreDemarcheId: titreDemarche.id,
      dateFin,
      dateDebut,
      phaseStatutId,
    })

    return titrePhases
  }, [])
}

const findDateDebut = (demarche: TitreDemarchePhaseFind, titreTypeId: TitreTypeId, isEtapeDateEnough: boolean): CaminoDate | null => {
  let dateDebut = null
  if (!demarche.etapes?.length) {
    return null
  }

  // on trie les étapes de façon ascendante pour le cas où
  // il existe une étape de publication et une étape rectificative,
  // on prend alors en compte l'originale
  const etapePublicationFirst = titreEtapesSortAscByOrdre(demarche.etapes).find(etape => titreEtapePublicationCheck(etape.typeId, titreTypeId))
  if (etapePublicationFirst && [ETAPES_STATUTS.ACCEPTE, ETAPES_STATUTS.FAIT].includes(etapePublicationFirst.statutId)) {
    // retourne l’étape de publication la plus récente avec une date de début spécifiée
    const etapePublicationHasDateDebut = titreEtapesSortDescByOrdre(demarche.etapes).find(titreEtape => titreEtapePublicationCheck(titreEtape.typeId, titreTypeId) && titreEtape.dateDebut)

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

type IntermediateTitrePhase = Omit<ITitrePhase, 'phaseStatutId'> & { dateDeFinParDefaut?: true }
/**
 * Retourne les phases d'un titre
 * @param titreDemarches - démarches d'un titre
 * @param aujourdhui - date du jour
 * @param titreTypeId - id du type de titre
 */
export const titrePhasesFind = (titreDemarches: TitreDemarchePhaseFind[], aujourdhui: CaminoDate, titreTypeId: TitreTypeId): ITitrePhase[] => {
  // On parcourt les démarches dans l’ordre chronologique
  const sortedDemarches = titreDemarcheSortAsc(titreDemarches).map(demarche => {
    return { ...demarche, etapes: demarche.etapes?.filter(({ statutId }) => statutId !== ETAPES_STATUTS.EN_CONSTRUCTION) }
  })

  const titreDemarcheAnnulation = titreDemarcheAnnulationFind(titreDemarches)
  const titreDemarcheAnnulationDate = titreDemarcheAnnulation?.etapes?.length ? titreDemarcheAnnulationDateFinFind(titreDemarcheAnnulation.etapes) : null

  const filteredDemarches = sortedDemarches.filter(demarche => demarche.etapes?.length && (isDemarcheTypeWithPhase(demarche.typeId) || demarche.etapes.some(({ dateFin, duree }) => dateFin || duree)))

  const phases = filteredDemarches.reduce<IntermediateTitrePhase[]>((acc, demarche) => {
    if (!demarche.etapes?.length) {
      return acc
    }
    const isFirstPhase = acc.length === 0
    let dateDebut: CaminoDate | null | undefined = findDateDebut(demarche, titreTypeId, isFirstPhase || (acc[acc.length - 1].dateDeFinParDefaut ?? false))

    if (isFirstPhase) {
      if (!isDemarcheTypeOctroi(demarche.typeId)) {
        return acc
      }

      if (dateDebut) {
        const { duree, dateFin } = newTitreDemarcheNormaleDateFinAndDureeFind(demarche.etapes)
        if (dateFin) {
          acc.push({
            dateDebut,
            dateFin,
            titreDemarcheId: demarche.id,
          })
        } else if (duree) {
          acc.push({
            dateDebut,
            dateFin: dateAddMonths(dateDebut, duree),
            titreDemarcheId: demarche.id,
          })
        } else {
          // si il n'y a pas de durée,
          // la date de fin par défaut est fixée au 31 décembre 2018,
          // selon l'article L144-4 du code minier :
          // https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000023501962&idArticle=LEGIARTI000023504741
          acc.push({
            dateDebut,
            dateFin: DATE_PAR_DEFAUT_TITRE_INFINI,
            dateDeFinParDefaut: true,
            titreDemarcheId: demarche.id,
          })
        }
      }

      return acc
    } else {
      if (!dateDebut) {
        dateDebut = acc[acc.length - 1].dateFin

        if (!dateDebut) {
          return acc
        }
      } else {
        acc[acc.length - 1].dateFin = dateDebut
      }
      const { duree, dateFin } = newTitreDemarcheNormaleDateFinAndDureeFind(demarche.etapes)

      if (!dateFin || dateFin > dateDebut) {
        if (dateFin) {
          acc.push({
            dateDebut,
            dateFin,
            titreDemarcheId: demarche.id,
          })
        } else if (duree) {
          acc.push({
            dateDebut,
            dateFin: dateAddMonths(dateDebut, duree),
            titreDemarcheId: demarche.id,
          })
        } else if (isDemarcheStatutNonStatue(demarche.statutId)) {
          acc.push({
            dateDebut,
            dateFin: null,
            titreDemarcheId: demarche.id,
          })
        }
      }
    }

    return acc
  }, [])

  return phases.map<ITitrePhase>(p => {
    delete p.dateDeFinParDefaut
    if (titreDemarcheAnnulationDate && p.dateFin && isBefore(titreDemarcheAnnulationDate, p.dateFin) && isBefore(p.dateDebut, titreDemarcheAnnulationDate)) {
      p.dateFin = titreDemarcheAnnulationDate
    }
    // si
    // - la date du jour est plus récente que la date de fin
    // le statut est valide
    // sinon,
    // - le statut est échu
    let phaseStatutId: PhaseStatutId = 'val'
    if (!p.dateFin) {
      phaseStatutId = 'val'
    } else {
      phaseStatutId = isBefore(p.dateFin, aujourdhui) ? 'ech' : 'val'
    }

    return { ...p, phaseStatutId }
  })
}

const titrePhaseDateDebutFind = (titreDemarche: TitreDemarchePhaseFind, titrePhases: ITitrePhase[], index: number, titreTypeId: TitreTypeId): CaminoDate => {
  // si
  // - la démarche est un octroi
  if (isDemarcheTypeOctroi(titreDemarche.typeId)) {
    // retourne une étape de publication si celle-ci possède une date de début
    const etapePublicationHasDateDebut = titreEtapesSortDescByOrdre(titreDemarche.etapes!).find(titreEtape => titreEtapePublicationCheck(titreEtape.typeId, titreTypeId) && titreEtape.dateDebut)

    if (etapePublicationHasDateDebut?.dateDebut) {
      // la date de début est égale à la date de début de l'étape de publication
      return etapePublicationHasDateDebut.dateDebut
    }
  }

  // retourne la phase précédente
  const phasePrevious = titrePhases[index - 1]

  // si il y a une phase précédente
  if (phasePrevious) {
    if (!phasePrevious.dateFin) {
      throw new Error(`une phase précédente sans date de fin n'est pas possible ${titreDemarche.id}`)
    }
    // la date de début est égale à la date de fin de l'étape précédente

    return phasePrevious.dateFin
  }

  // retourne la première étape de publication de la démarche
  const titreEtapePublicationFirst = titreEtapesSortAscByOrdre(titreDemarche.etapes!).find(te => titreEtapePublicationCheck(te.typeId, titreTypeId))

  // sinon la date de début est égale à la date de la première étape de publication
  return titreEtapePublicationFirst!.date
}

// trouve la date de fin d'une phase
// in:
// - titreDemarchesFiltered: uniquement les démarches
//   d'un titre qui donnent lieu à des phases
// - titreDemarche: la démarche dont on cherche la date de fin

const titrePhaseDateFinFind = (titreDemarchesFiltered: TitreDemarchePhaseFind[], titreDemarche: TitreDemarchePhaseFind) =>
  // sinon, calcule la date de fin en fonction des démarches
  titreDemarcheDateFinAndDureeFind(titreDemarchesFiltered.slice().reverse(), titreDemarche.ordre!).dateFin
