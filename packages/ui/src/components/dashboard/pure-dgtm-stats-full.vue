<template>
  <div class="width-full-p">
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr">
      <div>
        <LoadingElement v-slot="{ item }" :data="data"
          ><ConfigurableLineChart
            :chartConfiguration="sdomChartConfiguration(item)"
        /></LoadingElement>
      </div>
      <div>
        <LoadingElement v-slot="{ item }" :data="data"
          ><ConfigurableBarChart
            :chartConfiguration="depotChartConfiguration(item)"
        /></LoadingElement>
      </div>
      <div>
        <LoadingElement v-slot="{ item }" :data="data"
          ><ConfigurableLineChart
            :chartConfiguration="delaiChartConfiguration(item)"
        /></LoadingElement>
      </div>
      <div>
        <LoadingElement v-slot="{ item }" :data="data"
          ><ConfigurableLineChart
            :chartConfiguration="delaiPerConcessionChartConfiguration(item)"
        /></LoadingElement>
      </div>
      <div>
        <LoadingElement v-slot="{ item }" :data="data"
          ><ConfigurableLineChart
            :chartConfiguration="producteursOrChartConfiguration(item)"
        /></LoadingElement>
      </div>
      <div>
        <LoadingElement v-slot="{ item }" :data="data"
          ><ConfigurableLineChart
            :chartConfiguration="avisAXMChartConfiguration(item)"
        /></LoadingElement>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import LoadingElement from '@/components/_ui/pure-loader.vue'
import { AsyncData } from '@/api/client-rest'
import ConfigurableLineChart from '../_charts/configurableLine.vue'
import ConfigurableBarChart from '../_charts/configurableBar.vue'

import {
  sdomChartConfiguration,
  depotChartConfiguration,
  delaiChartConfiguration,
  delaiPerConcessionChartConfiguration,
  producteursOrChartConfiguration,
  avisAXMChartConfiguration
} from './dgtm-stats'

const data = ref<AsyncData<StatistiquesDGTM>>({ status: 'LOADING' })
const props = defineProps<{
  getDgtmStats: () => Promise<StatistiquesDGTM>
}>()

onMounted(async () => {
  try {
    const stats = await props.getDgtmStats()
    data.value = { status: 'LOADED', value: stats }
  } catch (e: any) {
    console.log('error', e)
    data.value = {
      status: 'ERROR',
      message: e.message ?? 'something wrong happened'
    }
  }
})
</script>
