import { emailCheck } from '../../tools/email-check.js'
import { UserNotNull } from 'camino-common/src/roles.js'

export const utilisateurEditionCheck = (utilisateur: UserNotNull) => {
  const errors = []

  if (utilisateur.email && !emailCheck(utilisateur.email)) {
    errors.push('adresse email invalide')
  }

  return errors
}
