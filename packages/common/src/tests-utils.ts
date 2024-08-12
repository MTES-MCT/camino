import { AdminUserNotNull, EntrepriseUserNotNull, toUtilisateurId, UserDefaut, UserNotNull, UserSuper } from './roles'

export type TestUser = Pick<UserSuper, 'role'> | Pick<UserDefaut, 'role'> | Pick<AdminUserNotNull, 'role' | 'administrationId'> | Pick<EntrepriseUserNotNull, 'role' | 'entreprises'>
export const testBlankUser: Omit<UserNotNull, 'role'> = {
  id: toUtilisateurId('id'),
  email: 'email@gmail.com',
  nom: 'nom',
  prenom: 'prenom',
  telephone_fixe: null,
  telephone_mobile: null,
}
