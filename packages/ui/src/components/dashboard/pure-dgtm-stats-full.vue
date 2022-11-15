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
          ><LineChart :data="graphDelaiData(item)"
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
import LineChart from '../_charts/line.vue'
import ConfigurableLineChart from '../_charts/configurableLine.vue'
import ConfigurableBarChart from '../_charts/configurableBar.vue'

import { CaminoAnnee, isAnnee } from 'camino-common/src/date'
import {
  datasetParams,
  sdomChartConfiguration,
  depotChartConfiguration
} from './dgtm-stats'

const data = ref<AsyncData<StatistiquesDGTM>>({ status: 'LOADING' })
const props = defineProps<{
  getDgtmStats: () => Promise<StatistiquesDGTM>
}>()

const graphDelaiData = (item: StatistiquesDGTM) => {
  const annees: CaminoAnnee[] = Object.keys(item.delais).filter(isAnnee)
  const datasets = []
  datasets.push({
    label: "Délai minimum d'instruction",
    data: annees.map(annee =>
      Math.round(Math.min(...item.delais[annee].delaiInstructionEnJours) / 30)
    ),
    ...datasetParams(0)
  })
  datasets.push({
    label: "Délai moyen d'instruction",
    data: annees.map(annee =>
      Math.round(
        item.delais[annee].delaiInstructionEnJours.reduce(
          (acc, current) => acc + current,
          0
        ) /
          item.delais[annee].delaiInstructionEnJours.length /
          30
      )
    ),
    ...datasetParams(1)
  })
  datasets.push({
    label: "Délai maximum d'instruction",
    data: annees.map(annee =>
      Math.round(Math.max(...item.delais[annee].delaiInstructionEnJours) / 30)
    ),
    ...datasetParams(2)
  })
  datasets.push({
    label: 'Délai minimum de CDM',
    data: annees.map(annee =>
      Math.round(
        Math.min(...item.delais[annee].delaiCommissionDepartementaleEnJours) /
          30
      )
    ),
    ...datasetParams(3)
  })
  datasets.push({
    label: 'Délai moyen de CDM',
    data: annees.map(annee =>
      Math.round(
        item.delais[annee].delaiCommissionDepartementaleEnJours.reduce(
          (acc, current) => acc + current,
          0
        ) /
          item.delais[annee].delaiCommissionDepartementaleEnJours.length /
          30
      )
    ),
    ...datasetParams(4)
  })
  datasets.push({
    label: 'Délai maximum de CDM',
    data: annees.map(annee =>
      Math.round(
        Math.max(...item.delais[annee].delaiCommissionDepartementaleEnJours) /
          30
      )
    ),
    ...datasetParams(5)
  })

  return {
    labels: annees,
    datasets
  }
}

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
