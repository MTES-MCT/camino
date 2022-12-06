import { isAdministration, isEntreprise, isSuper, User } from '../roles.js'

export const canReadActivites = (user: User) => isSuper(user) || isAdministration(user) || isEntreprise(user)
