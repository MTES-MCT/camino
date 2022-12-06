import { isAdministration, isSuper, User } from '../roles.js'

export const canReadTravaux = (user: User) => isSuper(user) || isAdministration(user)
