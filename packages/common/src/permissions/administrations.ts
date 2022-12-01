import { isAdministration, isSuper, User } from '../roles.js'
import { AdministrationId, Administrations, sortedAdministrations } from '../static/administrations.js'
import { Departements } from '../static/departement.js'

export const canReadActivitesTypesEmails = (user: User, administrationId: AdministrationId) => {
  if (isSuper(user) || (isAdministration(user) && Administrations[user.administrationId].typeId === 'min')) {
    // Utilisateur super ou membre de ministère (admin ou éditeur) : tous les droits
    return true
  } else if (isAdministration(user)) {
    const administration = Administrations[user.administrationId]

    const administrationIds: AdministrationId[] = []

    if (administration.regionId) {
      const departementIds = Object.values(Departements)
        .filter(({ regionId }) => regionId === administration.regionId)
        .map(({ id }) => id)
      // On récupère toutes les administrations départementales qui sont de la même région que l’administration régionale de l’utilisateur
      administrationIds.push(...sortedAdministrations.filter(({ departementId }) => departementIds.includes(departementId)).map(({ id }) => id))
    }

    administrationIds.push(user.administrationId)

    return administrationIds.includes(administrationId)
  }

  return false
}
