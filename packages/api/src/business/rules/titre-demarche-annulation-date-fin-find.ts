import { CaminoDate } from 'camino-common/src/date'

import {
  titreEtapesSortAscByOrdre,
  titreEtapesSortDescByOrdre
} from '../utils/titre-etapes-sort'
import { TitreEtapePhaseFind } from './titre-demarche-date-fin-duree-find'

/**
 * Retourne la date de fin d'une démarche d'annulation
 *
 * @param titreEtapes - les étapes de la démarche d'annulation
 * @returns la date de fin si elle existe
 */
export const titreDemarcheAnnulationDateFinFind = (
  titreEtapes: TitreEtapePhaseFind[]
): CaminoDate | null | undefined => {
  // si l’étape valide l’annulation
  const etapeAnnulationValideCheck = (te: TitreEtapePhaseFind) =>
    // si on a une décision expresse (dex) ou unilatérale (dux) ou implicite (dim)
    ['dex', 'dux', 'dim'].includes(te.typeId) ||
    // si l’ARM a une signature de l’avenant à l’autorisation de recherche minière fait
    (te.typeId === 'aco' && te.statutId === 'fai')

  // la dernière étape qui valide l’annulation et qui contient une date de fin
  const etapeAnnulationHasDateFin = titreEtapesSortDescByOrdre(
    titreEtapes
  ).find(te => te.dateFin && etapeAnnulationValideCheck(te))

  // si la démarche contient une date de fin
  if (etapeAnnulationHasDateFin) {
    return etapeAnnulationHasDateFin.dateFin
  }

  // sinon,
  // trouve la première étape qui valide l’annulation
  const etapeAnnulation = titreEtapesSortAscByOrdre(titreEtapes).find(
    etapeAnnulationValideCheck
  )

  // la date de fin est la date de l'étape
  return etapeAnnulation?.date ? etapeAnnulation.date : null
}
