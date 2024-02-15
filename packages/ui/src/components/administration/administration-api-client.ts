import { AdministrationId } from 'camino-common/src/static/administrations'
import { AdminUserNotNull } from 'camino-common/src/roles'
import { AdministrationActiviteTypeEmail } from 'camino-common/src/administrations'
import { getWithJson, postWithJson } from '../../api/client-rest'

export interface AdministrationApiClient {
  administrationActivitesTypesEmails: (administrationId: AdministrationId) => Promise<AdministrationActiviteTypeEmail[]>
  administrationUtilisateurs: (administrationId: AdministrationId) => Promise<AdminUserNotNull[]>
  administrationActiviteTypeEmailUpdate: (administrationId: AdministrationId, administrationActiviteTypeEmail: AdministrationActiviteTypeEmail) => Promise<void>
  administrationActiviteTypeEmailDelete: (administrationId: AdministrationId, administrationActiviteTypeEmail: AdministrationActiviteTypeEmail) => Promise<void>
}

export const administrationApiClient: AdministrationApiClient = {
  administrationActivitesTypesEmails: async (administrationId: AdministrationId) => getWithJson('/rest/administrations/:administrationId/activiteTypeEmails', { administrationId }),

  administrationUtilisateurs: async (administrationId: AdministrationId) => {
    return getWithJson('/rest/administrations/:administrationId/utilisateurs', { administrationId })
  },
  administrationActiviteTypeEmailUpdate: async (administrationId: AdministrationId, administrationActiviteTypeEmail: AdministrationActiviteTypeEmail) => {
    await postWithJson('/rest/administrations/:administrationId/activiteTypeEmails', { administrationId }, administrationActiviteTypeEmail)
  },

  administrationActiviteTypeEmailDelete: async (administrationId: AdministrationId, administrationActiviteTypeEmail: AdministrationActiviteTypeEmail) => {
    await postWithJson('/rest/administrations/:administrationId/activiteTypeEmails/delete', { administrationId }, administrationActiviteTypeEmail)
  },
}
