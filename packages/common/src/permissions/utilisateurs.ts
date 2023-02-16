import { isSuper, isAdministrationAdmin, isAdministrationEditeur, User, isAdministration, isEntreprise, isBureauDEtudes } from '../roles.js'

export const canCreateEntreprise = (user: User): boolean => isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)
export const canCreateUtilisateur = (user: User): boolean => isSuper(user) || isAdministrationAdmin(user)
export const canReadUtilisateurs = (user: User) => isSuper(user) || isAdministration(user) || isEntreprise(user) || isBureauDEtudes(user)

export const canReadUtilisateur = (user: User, id: string) => user?.id === id || canReadUtilisateurs(user)
