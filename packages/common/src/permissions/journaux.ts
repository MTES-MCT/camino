import { isSuper, User } from '../roles.js'

export const canReadJournaux = (user: User) => isSuper(user)
