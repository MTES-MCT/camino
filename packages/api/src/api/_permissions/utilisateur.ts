import { IUtilisateur, IUtilisateurCreation } from '../../types.js'
import { emailCheck } from '../../tools/email-check.js'
import {
  isAdministrationRole,
  isEntrepriseOrBureauDetudeRole,
  User,
  UserNotNull
} from 'camino-common/src/roles.js'

export const utilisateurEditionCheck = (
  utilisateur: UserNotNull
) => {
  const errors = []

  if (utilisateur.email && !emailCheck(utilisateur.email)) {
    errors.push('adresse email invalide')
  }

  return errors
}
