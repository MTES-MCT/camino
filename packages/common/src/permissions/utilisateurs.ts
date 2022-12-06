import { isAdministration, isBureauDEtudes, isEntreprise, isSuper, User } from '../roles.js'

export const canReadUtilisateurs = (user: User) => isSuper(user) || isAdministration(user) || isEntreprise(user) || isBureauDEtudes(user)
