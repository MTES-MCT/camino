import { QGISTokenRest, UtilisateurToEdit, UtilisateursSearchParamsInput, UtilisateursTable } from 'camino-common/src/utilisateur'

import { getWithJson, newGetWithJson, newPostWithJson, postWithJson } from '../../api/client-rest'
import { UserNotNull, UtilisateurId } from 'camino-common/src/roles'
import { CaminoError } from 'camino-common/src/zod-tools'

export interface UtilisateurApiClient {
  getUtilisateur: (userId: UtilisateurId) => Promise<CaminoError<string> | UserNotNull>
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
  removeUtilisateur: async (userId: UtilisateurId) => getWithJson('/rest/utilisateurs/:id/delete', { id: userId }),
  updateUtilisateur: async (utilisateur: UtilisateurToEdit) => postWithJson('/rest/utilisateurs/:id/permission', { id: utilisateur.id }, utilisateur),
  getQGISToken: async () => newPostWithJson('/rest/utilisateur/generateQgisToken', {}, {}),
}
