import { onMounted, ref } from 'vue'

import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { AsyncData, getWithJson } from '@/api/client-rest'
import { ChartWithExport } from '@/components/_charts/chart-with-export'

import {
  sdomChartConfiguration,
  depotChartConfiguration,
  delaiChartConfiguration,
  delaiPerConcessionChartConfiguration,
  producteursOrChartConfiguration,
  avisAXMChartConfiguration,
} from './dgtm-stats'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'

export interface Props {
  getDgtmStats?: () => Promise<StatistiquesDGTM>
}
export const DGTMStatsFull = caminoDefineComponent<Props>(['getDgtmStats'], props => {
  const data = ref<AsyncData<StatistiquesDGTM>>({ status: 'LOADING' })

  const charts = [sdomChartConfiguration, depotChartConfiguration, delaiChartConfiguration, delaiPerConcessionChartConfiguration, producteursOrChartConfiguration, avisAXMChartConfiguration]

  onMounted(async () => {
    try {
      if (props.getDgtmStats) {
        const stats = await props.getDgtmStats()
        data.value = { status: 'LOADED', value: stats }
      } else {
        const stats = await getWithJson('/rest/statistiques/dgtm', {})
        data.value = { status: 'LOADED', value: stats }
      }
    } catch (e: any) {
      console.log('error', e)
      data.value = {
        status: 'ERROR',
        message: e.message ?? 'something wrong happened',
      }
    }
  })
  return () => (
    <div class="width-full-p">
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr">
        {charts.map(chart => (
          <ChartWithExport data={data.value} getConfiguration={data => chart(data)} />
        ))}
      </div>
    </div>
  )
})
