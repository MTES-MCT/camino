import { isSuper, User } from '../roles'

export const canReadMetas = (user: User): boolean => isSuper(user)
