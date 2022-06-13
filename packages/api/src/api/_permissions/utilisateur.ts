import { IUtilisateur, IUtilisateurCreation } from '../../types'
import { emailCheck } from '../../tools/email-check'
import { permissionCheck } from 'camino-common/src/roles'

const utilisateurEditionCheck = (
  utilisateur: IUtilisateur | IUtilisateurCreation
) => {
  const errors = []

  if (utilisateur.email && !emailCheck(utilisateur.email)) {
    errors.push('adresse email invalide')
  }

  if (
    !permissionCheck(utilisateur?.role, ['admin', 'editeur', 'lecteur']) &&
    utilisateur.administrations &&
    utilisateur.administrations.length
  ) {
    errors.push(
      "les permissions de cet utilisateur ne permettent pas de l'associer à une administration"
    )
  }

  if (
    !permissionCheck(utilisateur?.role, ['entreprise']) &&
    utilisateur.entreprises &&
    utilisateur.entreprises.length
  ) {
    errors.push(
      "les permissions de cet utilisateur ne permettent pas de l'associer à une entreprise"
    )
  }

  return errors
}

export { utilisateurEditionCheck }
