import { AdministrationRole, AdminUserNotNull, EntrepriseUserNotNull, UserDefaut, UserNotNull, UserSuper } from './roles.js'
import { AdministrationId } from './static/administrations'

export type TestUser = Pick<UserSuper, 'role'> | Pick<UserDefaut, 'role'> | Pick<AdminUserNotNull, 'role' | 'administrationId'> | Pick<EntrepriseUserNotNull, 'role' | 'entreprises'>
export const testBlankUser: Omit<UserNotNull, 'role'> = {
  id: 'id',
  email: 'email@gmail.com',
  nom: 'nom',
  prenom: 'prenom',
}
export const getTestUser = (param: { role: 'super' | 'defaut' | 'entreprise' | 'bureau d’études' } | { role: AdministrationRole; administrationId: AdministrationId }): UserNotNull => {
  switch (param.role) {
    case 'super':
    case 'defaut':
      return { ...testBlankUser, role: param.role }
    case 'admin':
    case 'lecteur':
    case 'editeur':
      return { ...testBlankUser, ...param }
    case 'entreprise':
    case 'bureau d’études':
      return { ...testBlankUser, ...param, entreprises: [] }
  }
}
