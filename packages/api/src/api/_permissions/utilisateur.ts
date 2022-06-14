import { IUtilisateur, IUtilisateurCreation } from '../../types'
import { emailCheck } from '../../tools/email-check'
import { isAdministration, isEntreprise } from 'camino-common/src/roles'

const utilisateurEditionCheck = (
  utilisateur: IUtilisateur | IUtilisateurCreation
) => {
  const errors = []

  if (utilisateur.email && !emailCheck(utilisateur.email)) {
    errors.push('adresse email invalide')
  }

  if (
    !isAdministration(utilisateur) &&
    utilisateur.administrations &&
    utilisateur.administrations.length
  ) {
    errors.push(
      "le rôle de cet utilisateur ne permet pas de l'associer à une administration"
    )
  }

  if (
    !isEntreprise(utilisateur) &&
    utilisateur.entreprises &&
    utilisateur.entreprises.length
  ) {
    errors.push(
      "le rôle de cet utilisateur ne permet pas de l'associer à une entreprise"
    )
  }

  return errors
}

export { utilisateurEditionCheck }
