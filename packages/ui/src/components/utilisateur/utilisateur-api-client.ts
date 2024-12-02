import { QGISTokenRest, UtilisateurToEdit, UtilisateursSearchParamsInput, UtilisateursTable } from 'camino-common/src/utilisateur'

import { getWithJson, newGetWithJson, newPostWithJson, postWithJson } from '../../api/client-rest'
import { UserNotNull, UtilisateurId } from 'camino-common/src/roles'
import { CaminoError } from 'camino-common/src/zod-tools'

export interface UtilisateurApiClient {
  getUtilisateur: (userId: UtilisateurId) => Promise<CaminoError<string> | UserNotNull>
  getUtilisateurNewsletter: (userId: UtilisateurId) => Promise<{ subscribed: boolean } | CaminoError<string>>
  updateUtilisateurNewsletter: (userId: UtilisateurId, subscribe: boolean) => Promise<void>
  registerToNewsletter: (email: string) => Promise<void>
  removeUtilisateur: (userId: UtilisateurId) => Promise<void>
  updateUtilisateur: (user: UtilisateurToEdit) => Promise<void>
  getQGISToken: () => Promise<CaminoError<string> | QGISTokenRest>
  getUtilisateurs: (params: UtilisateursSearchParamsInput) => Promise<CaminoError<string> | UtilisateursTable>
}

export const utilisateurApiClient: UtilisateurApiClient = {
  getUtilisateurs: async (params: UtilisateursSearchParamsInput) => {
    return newGetWithJson('/rest/utilisateurs', {}, params)
  },
  getUtilisateur: async (userId: UtilisateurId) => {
    return newGetWithJson('/rest/utilisateurs/:id', { id: userId })
  },
  getUtilisateurNewsletter: async (userId: UtilisateurId) => newGetWithJson('/rest/utilisateurs/:id/newsletter', { id: userId }),
  updateUtilisateurNewsletter: async (userId: UtilisateurId, newsletter: boolean) => {
    await postWithJson('/rest/utilisateurs/:id/newsletter', { id: userId }, { newsletter })
  },
  registerToNewsletter: async (email: string) => {
    await newGetWithJson('/rest/utilisateurs/registerToNewsletter', {}, { email })
  },
  removeUtilisateur: async (userId: UtilisateurId) => getWithJson('/rest/utilisateurs/:id/delete', { id: userId }),
  updateUtilisateur: async (utilisateur: UtilisateurToEdit) => postWithJson('/rest/utilisateurs/:id/permission', { id: utilisateur.id }, utilisateur),
  getQGISToken: async () => newPostWithJson('/rest/utilisateur/generateQgisToken', {}, {}),
}
