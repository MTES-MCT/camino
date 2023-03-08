import { ITitreEtape } from '../../types.js'

// si il y a un dépot de la demande
// -> retourne la date de cette étape
// sinon
// retourne la date de la première étape

export const titreDemarcheDepotDemandeDateFind = (titreEtapes: Pick<ITitreEtape, 'date' | 'typeId'>[] | undefined): undefined | string => {
  if (!titreEtapes || titreEtapes.length === 0) {
    return undefined
  }

  const titreEtapeDemande = titreEtapes.find(te => te.typeId === 'mdp')

  if (titreEtapeDemande) {
    return titreEtapeDemande.date
  }

  return titreEtapes.map(te => te.date).sort()[0]
}
