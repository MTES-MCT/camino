import { onMounted, ref } from 'vue'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { AsyncData } from '@/api/client-rest'
import { ChartWithExport } from '@/components/_charts/chart-with-export'
import { sdomChartConfiguration, depotChartConfiguration, delaiChartConfiguration } from './dgtm-stats'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { DashboardApiClient } from './dashboard-api-client'

export interface Props {
  apiClient: Pick<DashboardApiClient, 'getDgtmStats'>
}

export const PureDGTMStats = caminoDefineComponent<Props>(['apiClient'], props => {
  const data = ref<AsyncData<StatistiquesDGTM>>({ status: 'LOADING' })

  onMounted(async () => {
    try {
      const stats = await props.apiClient.getDgtmStats()
      data.value = { status: 'LOADED', value: stats }
    } catch (e: any) {
      console.error('error', e)
      data.value = {
        status: 'ERROR',
        message: e.message ?? 'something wrong happened',
      }
    }
  })

  return () => (
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr">
      <ChartWithExport data={data.value} getConfiguration={data => sdomChartConfiguration(data)} />
      <ChartWithExport data={data.value} getConfiguration={data => depotChartConfiguration(data)} />
      <ChartWithExport data={data.value} getConfiguration={data => delaiChartConfiguration(data)} />
    </div>
  )
})
