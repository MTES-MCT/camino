import { DeepReadonly } from 'camino-common/src/typescript-tools'
import { ITitreEtape } from '../../types'
import { CaminoDate } from 'camino-common/src/date'

// si il y a un dépot de la demande
// -> retourne la date de cette étape
// sinon
// retourne la date de la première étape

export const titreDemarcheDepotDemandeDateFind = (titreEtapes: DeepReadonly<Pick<ITitreEtape, 'date' | 'typeId'>[]> | undefined): undefined | CaminoDate => {
  if (!titreEtapes || titreEtapes.length === 0) {
    return undefined
  }

  const titreEtapeDemande = titreEtapes.find(te => te.typeId === 'mdp')

  if (titreEtapeDemande) {
    return titreEtapeDemande.date
  }

  return titreEtapes.map(te => te.date).toSorted()[0]
}
