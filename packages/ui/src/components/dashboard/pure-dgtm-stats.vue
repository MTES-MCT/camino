<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr">
    <ChartWithExport
      :data="data"
      :getConfiguration="data => sdomChartConfiguration(data)"
    />
    <ChartWithExport
      :data="data"
      :getConfiguration="data => depotChartConfiguration(data)"
    />
    <ChartWithExport
      :data="data"
      :getConfiguration="data => delaiChartConfiguration(data)"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { AsyncData } from '@/api/client-rest'
import ChartWithExport from '@/components/_charts/chart-with-export.vue'

import {
  sdomChartConfiguration,
  depotChartConfiguration,
  delaiChartConfiguration
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
    console.error('error', e)
    data.value = {
      status: 'ERROR',
      message: e.message ?? 'something wrong happened'
    }
  }
})
</script>
