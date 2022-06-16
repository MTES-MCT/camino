import { IUtilisateur } from '../../types'

import { userGet } from '../../database/queries/utilisateurs'

import {
  isAdministration,
  isAdministrationAdmin,
  isSuper
} from 'camino-common/src/roles'

/**
 * Valide la mise à jour d'un utilisateur
 *
 * @param user - utilisateur qui fait la modification
 * @param utilisateur - utilisateur modifié
 *
 * @returns une liste de messages d'erreur si l'utilisateur n'a pas le droit de faire les modifications
 */

const utilisateurUpdationValidate = async (
  user: IUtilisateur,
  utilisateur: IUtilisateur
) => {
  const utilisateurOld = await userGet(utilisateur.id)

  if (!utilisateurOld) return ["l'utilisateur n'existe pas"]

  if (!isSuper(user)) {
    if (isAdministration(utilisateur) && !utilisateur.administrationId) {
      return ["l'utilisateur doit être associé à une administration"]
    }

    // si le user n'est pas admin
    if (!isAdministrationAdmin(user)) {
      //   ni les administrations
      if (utilisateurOld.administrationId !== utilisateur.administrationId) {
        return ['droits insuffisants pour modifier les administrations']
      }

      return []
    }

    // sinon, le user est admin

    // si le user modifie l'administration de l'utilisateur
    if (utilisateurOld.administrationId !== utilisateur.administrationId) {
      // si le user n'a pas les droits sur l'administration
      if (user.administrationId !== utilisateur.administrationId) {
        // alors il ne peut modifier les administrations
        return ["droits admin insuffisants pour modifier l'administration"]
      }
    }
  }

  return []
}

export { utilisateurUpdationValidate }
