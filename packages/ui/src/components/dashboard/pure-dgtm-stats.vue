<template>
  <div>
    <div v-if="data.status === 'LOADING'" class="loaders fixed p">
      <div class="loader" />
    </div>
    <div v-if="data.status === 'LOADED'">
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr">
        <div><!-- placeholders for other stats --></div>
        <div><LineChart :data="graphData()" /></div>
        <div><!-- placeholders for other stats --></div>
      </div>
    </div>
    <Error
      v-if="data.status === 'ERROR'"
      :message="{
        type: 'error',
        value: data.message
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import Error from '@/components/error.vue'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { AsyncData } from '@/api/client-rest'
import LineChart from '../_charts/line.vue'
import { CaminoAnnee, isAnnee } from 'camino-common/src/date'
import { nextColor } from '../_charts/utils'

const data = ref<AsyncData<StatistiquesDGTM>>({ status: 'LOADING' })
const props = defineProps<{
  getDgtmStats: () => Promise<StatistiquesDGTM>
}>()

const graphData = () => {
  const dataNoRef = data.value
  if (dataNoRef.status === 'LOADED') {
    const annees: CaminoAnnee[] = Object.keys(
      dataNoRef.value.depotEtInstructions
    ).filter(isAnnee)
    const datasets = []
    datasets.push({
      label: 'Titres déposés',
      data: annees.map(
        annee => dataNoRef.value.depotEtInstructions[annee].totalTitresDeposes
      ),
      fill: false,
      tension: 0.5,
      backgroundColor: nextColor(0),
      borderColor: nextColor(0)
    })
    datasets.push({
      label: 'Titres octroyés',
      data: annees.map(
        annee => dataNoRef.value.depotEtInstructions[annee].totalTitresOctroyes
      ),
      fill: false,
      tension: 0.5,
      backgroundColor: nextColor(1),
      borderColor: nextColor(1)
    })
    datasets.push({
      label: 'AEX octroyés',
      data: annees.map(
        annee => dataNoRef.value.depotEtInstructions[annee].totalAXMOctroyees
      ),
      fill: false,
      tension: 0.5,
      backgroundColor: nextColor(2),
      borderColor: nextColor(2)
    })
    datasets.push({
      label: 'AEX déposés',
      data: annees.map(
        annee => dataNoRef.value.depotEtInstructions[annee].totalAXMDeposees
      ),
      fill: false,
      tension: 0.5,
      backgroundColor: nextColor(3),
      borderColor: nextColor(3)
    })

    return {
      labels: annees,
      datasets
    }
  }
  return {}
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
