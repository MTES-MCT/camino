import { IUtilisateur } from '../../types.js'

import { userGet } from '../../database/queries/utilisateurs.js'

import {
  isAdministrationRole,
  isAdministrationAdmin,
  isSuper,
  User,
  isAdministration,
  UserNotNull,
  isEntrepriseOrBureauDetudeRole,
  isEntrepriseOrBureauDEtude,
  isDefautRole,
  isSuperRole
} from 'camino-common/src/roles.js'
import { canEditUtilisateur, getAssignableRoles } from 'camino-common/src/permissions/utilisateurs.js'
import { equalStringArrays } from '../../tools/index.js'
import { emailCheck } from '../../tools/email-check.js'
import { isAdministrationId } from 'camino-common/src/static/administrations.js'


const isUser = (utilisateur: Omit<IUtilisateur, 'dateCreation'>): utilisateur is UserNotNull => {
  if (utilisateur.email && !emailCheck(utilisateur.email)) {
    return false
  }
  if ((isSuperRole(utilisateur.role) || isDefautRole(utilisateur.role)) && utilisateur.administrationId === undefined && utilisateur.entreprises?.length === 0) {
    return true
  }

  if (isAdministrationRole(utilisateur.role) && isAdministrationId(utilisateur.administrationId) && utilisateur.entreprises?.length === 0) {
    return true
  }
  if (isEntrepriseOrBureauDetudeRole(utilisateur.role) && utilisateur.administrationId === undefined && (utilisateur.entreprises?.length ?? 0) > 0) {
    return true
  }
  return  false
}

/**
 * Valide la mise à jour d'un utilisateur
 *
 * @param user - utilisateur qui fait la modification
 * @param utilisateur - utilisateur modifié
 */
// FIXME add thorough tests
// FIXME DO the createUser
export const utilisateurUpdationValidate = (
  user: User,
  utilisateur: IUtilisateur,
  utilisateurOld: User
) => {
  if (!isUser(utilisateur)) {
    throw new Error('utilisateur incorrect')
  }

  if (!utilisateurOld) {
    throw new Error("l'utilisateur n'existe pas")
  }

  if (!canEditUtilisateur(user, utilisateurOld) || !canEditUtilisateur(user, utilisateur)) {
    throw new Error('droits insuffisants')
  }

  if (!isSuper(user)) {
    if(utilisateur.role !== utilisateurOld.role && !getAssignableRoles(user).includes(utilisateur.role)){
      throw new Error('droits insuffisants pour modifier les rôles')
    }

    if( isAdministration(utilisateurOld)  && utilisateur.administrationId !== utilisateurOld.administrationId ){
      throw new Error('droits insuffisants pour modifier les administrations')
    }

    if( !isAdministrationAdmin(user) && isEntrepriseOrBureauDEtude(utilisateurOld) && !equalStringArrays(utilisateurOld.entreprises.map(({id}) => id).sort(), (utilisateur.entreprises ?? []).map(({id}) => id).sort()) ){
      throw new Error('droits insuffisants pour modifier les entreprises')
    }
  }
}
