import { isSuper, User } from '../roles.js'

export const canReadMetas = (user: User): boolean => isSuper(user)
