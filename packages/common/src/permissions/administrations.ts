import { isAdministration, isAdministrationAdmin, isAdministrationEditeur, isSuper, User } from '../roles.js'
import { AdministrationId, Administrations, sortedAdministrations } from '../static/administrations.js'
import { Departements } from '../static/departement.js'

export const canReadActivitesTypesEmails = (user: User, administrationId: AdministrationId) => {
  if (!canReadAdministrations(user)) {
    return false
  }

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

export const canReadAdministrations = (user: User) => isSuper(user) || isAdministration(user)

export const canEditEmails = (user: User, administrationId: AdministrationId): boolean => {
  if (isSuper(user) || ((isAdministrationAdmin(user) || isAdministrationEditeur(user)) && Administrations[user.administrationId].typeId === 'min')) {
    // Utilisateur super ou membre de ministère (admin ou éditeur) : tous les droits
    return true
  } else if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    // Membre d'une DREAL/DEAL vis-à-vis de la DREAL elle-même,
    // ou d'un DREAL/DEAL vis-à-vis d'une administration qui dépend d'elles
    // Admin ou éditeur : modifications
    // Admin, éditeur ou lecteur : lecture

    const administration = Administrations[user.administrationId]
    if (administration.regionId) {
      const departementIds = Object.values(Departements)
        .filter(({ regionId }) => regionId === administration.regionId)
        .map(({ id }) => id)
      // On récupère toutes les administrations départementales qui sont de la même région que l’administration régionale de l’utilisateur
      const administrationIds = sortedAdministrations.filter(({ departementId }) => departementIds.includes(departementId)).map(({ id }) => id)

      if (administration.typeId === 'dre' || administration.typeId === 'dea') {
        administrationIds.push(user.administrationId)
      }

      return administrationIds.includes(administrationId)
    }
  }

  return false
}
