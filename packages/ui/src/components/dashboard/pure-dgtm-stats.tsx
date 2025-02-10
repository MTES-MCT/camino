import { defineComponent, onMounted, ref } from 'vue'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { AsyncData } from '@/api/client-rest'
import { ChartWithExport } from '@/components/_charts/chart-with-export'
import { sdomChartConfiguration, depotChartConfiguration, delaiChartConfiguration } from './dgtm-stats'
import { DashboardApiClient } from './dashboard-api-client'

interface Props {
  apiClient: Pick<DashboardApiClient, 'getDgtmStats'>
}

export const PureDGTMStats = defineComponent<Props>(props => {
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
      <ChartWithExport
        data={data.value}
        getConfiguration={data => sdomChartConfiguration(data)}
        a11yDescription="autoyearlytable"
        description="Nombre de titres déposés ou octroyés en zones du SDOM par année"
      />
      <ChartWithExport data={data.value} getConfiguration={data => depotChartConfiguration(data)} a11yDescription="autoyearlytable" description="Nombre de titres et AEX par année" />
      <ChartWithExport
        data={data.value}
        getConfiguration={data => delaiChartConfiguration(data)}
        a11yDescription="autoyearlytable"
        description="Délais d'instruction, de CDM et de décision du préfet pour les AEX par année"
      />
    </div>
  )
})
// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureDGTMStats.props = ['apiClient']
