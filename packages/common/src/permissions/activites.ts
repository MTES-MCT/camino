import { isAdministration, isEntreprise, isSuper, User } from '../roles.js'
import { Administrations, ADMINISTRATION_TYPE_IDS } from '../static/administrations.js'

export const canReadActivites = (user: User) =>
  isSuper(user) ||
  isEntreprise(user) ||
  (isAdministration(user) && [ADMINISTRATION_TYPE_IDS.MINISTERE, ADMINISTRATION_TYPE_IDS.DEAL, ADMINISTRATION_TYPE_IDS.DREAL].includes(Administrations[user.administrationId].typeId))
