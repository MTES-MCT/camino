export const ROLES = [
  'super',
  'admin',
  'editeur',
  'lecteur',
  'entreprise',
  'defaut'
] as const
export type Role = typeof ROLES[keyof typeof ROLES]

// TODO 2022-06-02: vu les usages, pourquoi ne pas avoir des fonctions de plus haut niveau comme :
// - isSuper(user)
// - isAdmin(user) --> celui là peut se découper en deux, adminReader et adminWriter (permission lecteur)
// - isEntreprise(user)
// plutôt que passer un tableau de permission
// en plus, on pourrait avoir une interface user commun ça pourrait être cool ?
export const permissionCheck = (role: Role | null | undefined, roles: Role[]) =>
  !!(role && roles.includes(role))
