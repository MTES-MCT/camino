import { isNullOrUndefined, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { ITitreDemarche } from '../../types'

import { titreDemarcheSortAsc } from '../utils/titre-elements-sort-asc'
import { titreEtapesSortAscByOrdre } from '../utils/titre-etapes-sort'
import { isDemarcheTypeOctroi } from 'camino-common/src/static/demarchesTypes'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { CaminoDate } from 'camino-common/src/date'

export const titreDateDemandeFind = (titreDemarches: ITitreDemarche[]): CaminoDate | null => {
  // trouve la démarche génératrice du titre
  // - première démarche d'octroi ou mutation partielle
  const titreDemarchesSorted = titreDemarcheSortAsc(titreDemarches)
  const titreDemarche = titreDemarchesSorted.find(titreDemarche => isDemarcheTypeOctroi(titreDemarche.typeId))

  // si
  // - il n'y a pas de démarche génératrice
  // - la démarche génératrice n'a pas d'étapes
  // alors retourne null
  if (!titreDemarche || !titreDemarche.etapes!.length) return null

  // dans la démarche génératrice, trouve l'enregistrement de la demande
  const titreEtapesSorted = titreEtapesSortAscByOrdre(titreDemarche.etapes!)
  const titreEtape = titreEtapesSorted.find(te => te.typeId === ETAPES_TYPES.enregistrementDeLaDemande)

  // si
  // - il n'y a pas d'étape de dépôt ou d'enregistrement de la demande
  // - l'étape n'a pas de date
  // alors retourne null
  if (isNullOrUndefined(titreEtape) || isNullOrUndefinedOrEmpty(titreEtape.date)) return null

  // sinon
  // retourne la date de l'étape
  return titreEtape.date
}
