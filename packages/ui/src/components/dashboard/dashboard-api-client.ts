import { getWithJson } from '@/api/client-rest'
import { EntrepriseId, TitreEntreprise } from 'camino-common/src/entreprise'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { CommonTitreDREAL, CommonTitreONF, CommonTitrePTMG } from 'camino-common/src/titres'
import { titres } from '@/api/titres'

export interface DashboardApiClient {
  getOnfTitres: () => Promise<CommonTitreONF[]>
  getPtmgTitres: () => Promise<CommonTitrePTMG[]>
  getDrealTitres: () => Promise<CommonTitreDREAL[]>
  getDgtmStats: () => Promise<StatistiquesDGTM>
  getEntreprisesTitres: (entreprisesIds: EntrepriseId[]) => Promise<TitreEntreprise[]>
}

export const dashboardApiClient: DashboardApiClient = {
  getOnfTitres: async (): Promise<CommonTitreONF[]> => getWithJson('/rest/titresONF', {}),
  getPtmgTitres: async (): Promise<CommonTitrePTMG[]> => getWithJson('/rest/titresPTMG', {}),
  getDrealTitres: async (): Promise<CommonTitreDREAL[]> => getWithJson('/rest/titresDREAL', {}),
  getDgtmStats: async (): Promise<StatistiquesDGTM> => getWithJson('/rest/statistiques/dgtm', {}),
  getEntreprisesTitres: async (entreprisesIds: EntrepriseId[]) => {
    return (await titres({ entreprisesIds })).elements
  },
}
