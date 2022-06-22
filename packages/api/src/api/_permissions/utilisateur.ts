import { IUtilisateur, IUtilisateurCreation } from '../../types.js'
import { emailCheck } from '../../tools/email-check.js'
import {
  isAdministrationRole,
  isEntrepriseOrBureauDetudeRole
} from 'camino-common/src/roles.js'

const utilisateurEditionCheck = (
  utilisateur: IUtilisateur | IUtilisateurCreation
) => {
  const errors = []

  if (utilisateur.email && !emailCheck(utilisateur.email)) {
    errors.push('adresse email invalide')
  }

  if (!isAdministrationRole(utilisateur.role) && utilisateur.administrationId) {
    errors.push(
      "le rôle de cet utilisateur ne permet pas de l'associer à une administration"
    )
  }

  if (
    !isEntrepriseOrBureauDetudeRole(utilisateur.role) &&
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
