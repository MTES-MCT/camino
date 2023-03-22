// classe les démarches selon la date de leur première étape
// puis par ordre si les dates sont identiques
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes.js'
import { ITitreDemarche, ITitreEtape } from '../../types.js'
import { titreEtapesSortAscByOrdre } from './titre-etapes-sort.js'

export const titreDemarcheSortAsc = <T extends Pick<ITitreDemarche, 'typeId' | 'ordre'> & { etapes?: Pick<ITitreEtape, 'ordre' | 'date'>[] }>(titreElements: T[]): T[] =>
  titreElements.slice().sort((a, b) => {
    const aHasEtapes = a.etapes && a.etapes.length
    const bHasEtapes = b.etapes && b.etapes.length

    if (!aHasEtapes && bHasEtapes) return 1

    if (aHasEtapes && !bHasEtapes) return -1

    if (!aHasEtapes && !bHasEtapes) {
      const aType = DemarchesTypes[a.typeId]
      const bType = DemarchesTypes[b.typeId]

      return aType.ordre - bType.ordre
    }

    const dateA = titreEtapesSortAscByOrdre(a.etapes!)[0].date
    const dateB = titreEtapesSortAscByOrdre(b.etapes!)[0].date

    // TODO: supprimer les ! sur ordre
    return dateA < dateB ? -1 : dateA > dateB ? 1 : a.ordre! - b.ordre!
  })
