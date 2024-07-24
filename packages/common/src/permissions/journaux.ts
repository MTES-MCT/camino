import { isSuper, User } from '../roles'

export const canReadJournaux = (user: User): boolean => isSuper(user)
