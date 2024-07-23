// classe les démarches selon la date de leur première étape
// puis par ordre si les dates sont identiques
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { ITitreDemarche, ITitreEtape } from '../../types'
import { titreEtapesSortAscByOrdre } from './titre-etapes-sort'

export type TitreDemarcheSortAscMinimalDemarche = Pick<ITitreDemarche, 'typeId' | 'ordre'> & { etapes?: Pick<ITitreEtape, 'ordre' | 'date'>[] }
export const titreDemarcheSortAsc = <T extends TitreDemarcheSortAscMinimalDemarche>(titreElements: T[]): T[] =>
  titreElements.slice().sort((a, b) => {
    const aHasEtapes = a.etapes && a.etapes.length
    const bHasEtapes = b.etapes && b.etapes.length

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!aHasEtapes && bHasEtapes) return 1

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (aHasEtapes && !bHasEtapes) return -1

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!aHasEtapes && !bHasEtapes) {
      const aType = DemarchesTypes[a.typeId]
      const bType = DemarchesTypes[b.typeId]

      return aType.nom.localeCompare(bType.nom)
    }

    const dateA = titreEtapesSortAscByOrdre(a.etapes!)[0].date
    const dateB = titreEtapesSortAscByOrdre(b.etapes!)[0].date

    // TODO: supprimer les ! sur ordre
    return dateA < dateB ? -1 : dateA > dateB ? 1 : a.ordre! - b.ordre!
  })
