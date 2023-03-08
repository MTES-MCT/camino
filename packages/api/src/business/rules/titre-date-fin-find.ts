import { ITitreDemarche } from '../../types.js'

import titreDemarchesSortAsc from '../utils/titre-elements-sort-asc.js'
import titreDemarcheDateFinAndDureeFind from './titre-demarche-date-fin-duree-find.js'

export const titreDateFinFind = (titreDemarches: ITitreDemarche[]) => {
  // la dernière démarche dont le statut est acceptée ou terminée
  const titreDemarche = titreDemarchesSortAsc(titreDemarches)
    .reverse()
    .find(titreDemarche => ['acc', 'ter'].includes(titreDemarche.statutId!))

  if (!titreDemarche) return null

  return titreDemarcheDateFinAndDureeFind(titreDemarches, titreDemarche.ordre!).dateFin
}
