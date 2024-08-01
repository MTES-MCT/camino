import { getWithJson } from '@/api/client-rest'
import { EntrepriseId, TitreEntreprise } from 'camino-common/src/entreprise'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { CommonTitreAdministration } from 'camino-common/src/titres'
import { titres } from '@/api/titres'

export interface DashboardApiClient {
  getAdministrationTitres: () => Promise<CommonTitreAdministration[]>
  getDgtmStats: () => Promise<StatistiquesDGTM>
  getEntreprisesTitres: (entreprisesIds: EntrepriseId[]) => Promise<TitreEntreprise[]>
}

export const dashboardApiClient: DashboardApiClient = {
  getAdministrationTitres: async (): Promise<CommonTitreAdministration[]> => getWithJson('/rest/titresAdministrations', {}),
  getDgtmStats: async (): Promise<StatistiquesDGTM> => getWithJson('/rest/statistiques/dgtm', {}),
  getEntreprisesTitres: async (entreprisesIds: EntrepriseId[]) => {
    return (await titres({ entreprisesIds })).elements
  },
}
