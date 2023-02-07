import { isAdministrationAdmin, isAdministrationEditeur, isSuper, User } from '../roles.js'
import { TitreTypeId } from '../static/titresTypes.js'
import { isGestionnaire } from '../static/administrationsTitresTypes.js'
import { TitreStatutId } from '../static/titresStatuts.js'
import { canAdministrationModifyDemarches } from '../static/administrationsTitresTypesTitresStatuts.js'
import { AdministrationId, Administrations } from '../static/administrations.js'

export const canCreateDemarche = (user: User, titreTypeId: TitreTypeId, titreStatutId: TitreStatutId, administrations: AdministrationId[]): boolean => {
  if (isSuper(user)) {
    return true
  } else if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    if (administrations.includes(user.administrationId) || isGestionnaire(user.administrationId, titreTypeId)) {
      if (canAdministrationModifyDemarches(user.administrationId, titreTypeId, titreStatutId)) {
        return true
      }
    }
  }

  return false
}

export const canCreateTravaux = (user: User, titreTypeId: TitreTypeId, administrations: AdministrationId[]): boolean => {
  if (isSuper(user)) {
    return true
  } else if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    if (administrations.includes(user.administrationId) || isGestionnaire(user.administrationId, titreTypeId)) {
      const isDreal = ['dre', 'dea'].includes(Administrations[user.administrationId].typeId)
      if (isDreal) {
        return true
      }
    }
  }

  return false
}
